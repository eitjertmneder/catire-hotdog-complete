import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LogoutDTO, PermissionCheckDTO } from './dto/jwt.dto';
import { type Request as TypedRequest } from 'src/types';
import { User } from '@prisma/client';
import AuthDTO from './dto/auth.dto';
import { Module, ModulesPermissions, Permission } from 'src/types/permissions';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('/register')
  async register(@Body() body: CreateUserDto) {
    return await this.userService.createUser(body);
  }

  @Post('/login')
  async loginDirect(@Body() body: AuthDTO) {
    return await this.authService.login(body.email, body.password);
  }

  @Post('/google')
  async googleLogin(@Body('idToken') idToken: string) {
    if (!idToken) {
      throw new UnauthorizedException('ID token de Google requerido');
    }
    return await this.authService.googleLogin(idToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Request() req: TypedRequest): Promise<User | null> {
    return await this.userService.getUserById(req.user.id);
  }

  @Post('/logout')
  async logout(@Body() body: LogoutDTO) {
    const result = await this.authService.logout(body.refreshToken);
    return {
      message: result.success ? 'Sesión cerrada' : 'No se encontró el token',
    };
  }

  @Post('/validate')
  async validateToken(@Body('token') token: string) {
    if (!token) {
      throw new UnauthorizedException('El token es requerido');
    }
    const info = await this.authService.verifyToken(token);
    if (!info) throw new UnauthorizedException('Token inválido');
    return info;
  }

  @Post('/check-permission')
  async checkPermission(@Body() body: PermissionCheckDTO) {
    const info = await this.authService.verifyToken(body.token);
    if (!info) return { allowed: false, message: 'Token inválido' };
    const roleId = info.role_id;
    if (!roleId) return { allowed: false, message: 'Rol no encontrado' };
    const role = await this.authService.getRoleById(roleId);
    if (!role) return { allowed: false, message: 'Rol no encontrado' };
    const perms = role.permissions_json as ModulesPermissions;
    const modulePerm = perms[body.module as Module];
    const allowed =
      Array.isArray(modulePerm) &&
      modulePerm.includes(body.action as Permission);
    return { allowed, user: info };
  }

  // Admin: unlock a user
  @UseGuards(JwtAuthGuard)
  @Post('/unlock-user')
  async unlockUser(@Body('email') email: string) {
    if (!email) throw new UnauthorizedException('Email requerido');
    this.authService.unlockUser(email);
    return { message: `Usuario ${email} desbloqueado` };
  }

  // Admin: get locked users
  @UseGuards(JwtAuthGuard)
  @Get('/locked-users')
  async getLockedUsers() {
    return this.authService.getLockedUsers();
  }

  @Post('/firebase-sync')
  async firebaseSync(@Body('firebaseToken') firebaseToken: string) {
    if (!firebaseToken) {
      throw new UnauthorizedException('Firebase token requerido');
    }
    return await this.authService.firebaseSync(firebaseToken);
  }}
