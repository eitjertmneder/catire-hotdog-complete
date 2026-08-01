import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SecurityService } from '../security/security.service';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TokenPairDTO } from './dto/jwt.dto';
import { User } from '@prisma/client';
import { Payload } from './strategy/jwt.strategy';
import { UserRole } from 'src/types/user';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private securityService: SecurityService,
  ) {}

  private async getLockoutInfo(email: string): Promise<{ locked: boolean; remainingSeconds: number }> {
    const record = await this.prisma.loginAttempt.findUnique({ where: { email } });
    if (!record) return { locked: false, remainingSeconds: 0 };

    // If there's a lockout time set
    if (record.locked_until) {
      // Check if lockout is still active
      if (record.locked_until > new Date()) {
        const remainingMs = record.locked_until.getTime() - Date.now();
        return { locked: true, remainingSeconds: Math.ceil(remainingMs / 1000) };
      }
      // Lockout expired, clear record
      await this.prisma.loginAttempt.delete({ where: { email } });
      return { locked: false, remainingSeconds: 0 };
    }

    // No lockout set, but attempts exist - not locked
    return { locked: false, remainingSeconds: 0 };
  }

  private async recordFailedAttempt(email: string): Promise<{ locked: boolean; remainingSeconds: number; attemptsLeft: number }> {
    const existing = await this.prisma.loginAttempt.findUnique({ where: { email } });
    const count = (existing?.count || 0) + 1;
    const maxAttempts = 3;
    const attemptsLeft = Math.max(0, maxAttempts - count);

    // Progressive lockout durations (in milliseconds)
    const lockoutDurations = [
      5 * 60 * 1000,   // 1st lockout: 5 minutes
      10 * 60 * 1000,  // 2nd lockout: 10 minutes
      20 * 60 * 1000,  // 3rd lockout: 20 minutes
    ];

    // Count how many times this email has been locked before
    const lockoutCount = existing?.locked_until ? (existing.count >= 3 ? Math.floor((existing.count - 3) / 3) + 1 : 0) : 0;

    if (count >= maxAttempts) {
      // Calculate which lockout level we're at
      const lockoutIndex = Math.min(lockoutCount, lockoutDurations.length - 1);
      const lockoutDuration = lockoutDurations[lockoutIndex];
      const lockedUntil = new Date(Date.now() + lockoutDuration);

      await this.prisma.loginAttempt.upsert({
        where: { email },
        update: { count, locked_until: lockedUntil },
        create: { email, count, locked_until: lockedUntil },
      });

      const remainingSeconds = Math.ceil(lockoutDuration / 1000);
      return { locked: true, remainingSeconds, attemptsLeft: 0 };
    }

    await this.prisma.loginAttempt.upsert({
      where: { email },
      update: { count },
      create: { email, count },
    });

    return { locked: false, remainingSeconds: 0, attemptsLeft };
  }

  async clearAttempts(email: string) {
    await this.prisma.loginAttempt.deleteMany({ where: { email } });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userService.findOneUser(email);
      if (!user) return null;

      // Try with pepper first (new passwords)
      const pepperMatch = await this.securityService.verifyPassword(password, user.password);
      if (pepperMatch) return user;

      // Fallback: plain bcrypt (legacy passwords from seed/old registrations)
      const bcrypt = await import('bcrypt');
      const legacyMatch = await bcrypt.compare(String(password), String(user.password));
      if (legacyMatch) return user;

      return null;
    } catch (error: unknown) {
      return null;
    }
  }

  async login(email: string, password: string): Promise<TokenPairDTO> {
    // Check lockout
    const lockout = await this.getLockoutInfo(email);
    if (lockout.locked) {
      throw new UnauthorizedException(
        `Cuenta bloqueada. Intenta de nuevo en ${lockout.remainingSeconds} segundos.`
      );
    }

    const user = await this.validateUser(email, password);
    if (!user) {
      const lockoutResult = await this.recordFailedAttempt(email);
      if (lockoutResult.locked) {
        const minutes = Math.ceil(lockoutResult.remainingSeconds / 60);
        // Log failed login to audit
        try {
          await axios.post('http://order-service:3000/audit', {
            event_type: 'login_fail',
            action: 'LOGIN_FAILURE',
            description: `Intento de login fallido para ${email}. Cuenta bloqueada por ${minutes} minutos.`,
            user_email: email,
            severity: 'warning',
          });
        } catch (e) {
          // Don't fail login if audit fails
        }
        throw new UnauthorizedException(
          `Demasiados intentos fallidos. Cuenta bloqueada por ${minutes} minutos.`
        );
      }
      // Log failed login to audit
      try {
        await axios.post('http://order-service:3000/audit', {
          event_type: 'login_fail',
          action: 'LOGIN_FAILURE',
          description: `Intento de login fallido para ${email}. Quedan ${lockoutResult.attemptsLeft} intentos.`,
          user_email: email,
          severity: 'warning',
        });
      } catch (e) {
        // Don't fail login if audit fails
      }
      throw new UnauthorizedException(
        `Correo o clave incorrectos. Te quedan ${lockoutResult.attemptsLeft} intento(s).`
      );
    }

    // Success - clear attempts
    await this.clearAttempts(email);
    return await this.issueTokens(user);
  }

  async googleLogin(idToken: string): Promise<TokenPairDTO> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
      );
      const googleUser = response.data;

      if (!googleUser || !googleUser.email) {
        throw new UnauthorizedException('Token de Google inválido.');
      }

      const { email, name, picture, sub: googleId } = googleUser;

      let user = await this.userService.findOneUser(email);

      if (!user) {
        const newUser = await this.prisma.user.create({
          data: {
            email,
            full_name: name || email.split('@')[0],
            password: await this.generateRandomPassword(),
            dni: 0,
            phone_1: '',
            google_id: googleId,
            avatar_url: picture,
            provider: 'google',
            role_id: 1,
          },
          include: { role: true },
        });
        user = newUser;
      } else if (!user.google_id) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { google_id: googleId, avatar_url: picture, provider: 'google' },
        });
      }

      return await this.issueTokens(user!);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Error al autenticar con Google.');
    }
  }

  private async generateRandomPassword(): Promise<string> {
    const bcrypt = await import('bcrypt');
    const randomBytes = Math.random().toString(36).substring(2, 15);
    return await bcrypt.hash(randomBytes, 10);
  }

  private async createAndSaveRefreshToken(user: User): Promise<string> {
    const payload: Payload = { userId: user.id, username: user.email };
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
    await this.prisma.refreshToken.deleteMany({ where: { user_id: user.id } });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: { token: refreshToken, user_id: user.id, expires_at: expiresAt },
    });
    return refreshToken;
  }

  public async issueTokens(user: User): Promise<TokenPairDTO> {
    const payload: Payload = { userId: user.id, username: user.email };
    const access_token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
    const refresh_token = await this.createAndSaveRefreshToken(user);
    return { access_token, refresh_token, message: '' };
  }

  async verifyToken(token: string): Promise<UserRole | null> {
    try {
      if (!token) return null;
      const payload = await this.jwtService.verifyAsync<Payload>(token, {
        secret: process.env.JWT_SECRET,
      });
      const userId = Number(payload.userId);
      const user = await this.userService.getUserById(userId);
      if (!user) return null;
      return user;
    } catch (error: unknown) {
      return null;
    }
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return { success: false };
    try {
      type TokenRecord = { id: number } | null;
      const found = (await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      })) as TokenRecord;
      if (!found) return { success: false };
      await this.prisma.refreshToken.delete({ where: { id: found.id } });
      return { success: true };
    } catch (e: unknown) {
      return { success: false };
    }
  }

  async logoutAll(userId: number) {
    try {
      await this.prisma.refreshToken.deleteMany({ where: { user_id: userId } });
      return { success: true };
    } catch (e: unknown) {
      return { success: false };
    }
  }

  async getRoleById(id: number) {
    return await this.prisma.role.findUnique({ where: { id } });
  }

  // Admin: unlock user by clearing their login attempts
  async unlockUser(email: string): Promise<boolean> {
    await this.prisma.loginAttempt.deleteMany({ where: { email } });
    return true;
  }

  // Get lockout status for a user
  async getLockoutStatus(email: string) {
    return this.getLockoutInfo(email);
  }

  // Get all locked users (admin)
  async getLockedUsers(): Promise<{ email: string; remainingSeconds: number }[]> {
    const now = new Date();
    const lockedRecords = await this.prisma.loginAttempt.findMany({
      where: {
        locked_until: { gt: now },
      },
    });

    return lockedRecords.map((record) => ({
      email: record.email,
      remainingSeconds: Math.ceil((record.locked_until!.getTime() - Date.now()) / 1000),
    }));
  }

  async firebaseSync(firebaseToken: string) {
    // Verify Firebase token via Google's tokeninfo endpoint
    const response = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + firebaseToken);
    if (!response.ok) {
      throw new UnauthorizedException('Token de Firebase invalido');
    }
    const payload = await response.json();
    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    const firebaseUid = payload.sub;

    // Find or create user
    let user = await this.prisma.user.findFirst({ where: { email, deleted_at: null } });
    if (!user) {
      const clientRole = await this.prisma.role.findUnique({ where: { name: 'client' } });
      user = await this.prisma.user.create({
        data: {
          email,
          full_name: name,
          password: '',
          role_id: clientRole?.id ?? 1,
          provider: 'firebase',
          firebase_uid: firebaseUid,
          avatar_url: payload.picture || null,
          dni: 0,
          phone_1: '',
        },
      });
    } else if (!user.firebase_uid) {
      // Link existing user to Firebase
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { firebase_uid: firebaseUid, provider: 'firebase' },
      });
    }

    // Generate our own JWT
    const tokens = await this.issueTokens(user);
    return { access_token: tokens.access_token, user };
  }}




