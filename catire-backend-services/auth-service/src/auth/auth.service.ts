import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SecurityService } from '../security/security.service';
import { UserService } from 'src/user/user.service';
import { SecurityService } from '../security/security.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { JwtService } from '@nestjs/jwt';
import { SecurityService } from '../security/security.service';
import { TokenPairDTO } from './dto/jwt.dto';
import { SecurityService } from '../security/security.service';
import { User } from '@prisma/client';
import { SecurityService } from '../security/security.service';
import { Payload } from './strategy/jwt.strategy';
import { SecurityService } from '../security/security.service';
import { UserRole } from 'src/types/user';
import { SecurityService } from '../security/security.service';
import axios from 'axios';
import { SecurityService } from '../security/security.service';

// In-memory lockout tracker
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  private securityService: SecurityService) {}

  private getLockoutInfo(email: string): { locked: boolean; remainingSeconds: number } {
    const record = loginAttempts.get(email);
    if (!record) return { locked: false, remainingSeconds: 0 };

    const now = Date.now();
    if (record.lockedUntil > now) {
      return { locked: true, remainingSeconds: Math.ceil((record.lockedUntil - now) / 1000) };
    }

    // Lockout expired, clear record
    loginAttempts.delete(email);
    return { locked: false, remainingSeconds: 0 };
  }

  private recordFailedAttempt(email: string): { locked: boolean; remainingSeconds: number } {
    const record = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
    record.count++;

    if (record.count >= 3) {
      // Calculate lockout duration: 25s for 3rd, increases with more attempts
      const lockoutDuration = 25000 + (record.count - 3) * 10000;
      record.lockedUntil = Date.now() + lockoutDuration;
      loginAttempts.set(email, record);
      return { locked: true, remainingSeconds: Math.ceil(lockoutDuration / 1000) };
    }

    loginAttempts.set(email, record);
    return { locked: false, remainingSeconds: 0 };
  }

  private clearAttempts(email: string) {
    loginAttempts.delete(email);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userService.findOneUser(email);
      if (!user) return null;

      const bcrypt = await import('bcrypt');
      const matchResult = await bcrypt.compare(String(password), String(user.password));
      if (user && matchResult) {
        return user;
      }
      return null;
    } catch (error: unknown) {
      return null;
    }
  }

  async login(email: string, password: string): Promise<TokenPairDTO> {
    // Check lockout
    const lockout = this.getLockoutInfo(email);
    if (lockout.locked) {
      throw new UnauthorizedException(
        `Cuenta bloqueada. Intenta de nuevo en ${lockout.remainingSeconds} segundos.`
      );
    }

    const user = await this.validateUser(email, password);
    if (!user) {
      const lockoutResult = this.recordFailedAttempt(email);
      if (lockoutResult.locked) {
        throw new UnauthorizedException(
          `Demasiados intentos fallidos. Cuenta bloqueada por ${lockoutResult.remainingSeconds} segundos.`
        );
      }
      const attemptsLeft = 3 - (loginAttempts.get(email)?.count || 0);
      throw new UnauthorizedException(
        `Correo o clave incorrectos. Te quedan ${attemptsLeft} intentos.`
      );
    }

    // Success - clear attempts
    this.clearAttempts(email);
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
  unlockUser(email: string): boolean {
    loginAttempts.delete(email);
    return true;
  }

  // Get lockout status for a user
  getLockoutStatus(email: string) {
    return this.getLockoutInfo(email);
  }

  // Get all locked users (admin)
  getLockedUsers(): { email: string; remainingSeconds: number }[] {
    const locked: { email: string; remainingSeconds: number }[] = [];
    const now = Date.now();
    loginAttempts.forEach((record, email) => {
      if (record.lockedUntil > now) {
        locked.push({
          email,
          remainingSeconds: Math.ceil((record.lockedUntil - now) / 1000),
        });
      }
    });
    return locked;
  }
}



