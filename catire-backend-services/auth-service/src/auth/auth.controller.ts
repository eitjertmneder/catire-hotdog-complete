import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionGuard } from './permission.guard';
import { CheckPermission } from './permission.decorator';
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
      message: result.success ? 'Sesion cerrada' : 'No se encontro el token',
    };
  }

  @Post('/validate')
  async validateToken(@Body('token') token: string) {
    if (!token) {
      throw new UnauthorizedException('El token es requerido');
    }
    const info = await this.authService.verifyToken(token);
    if (!info) throw new UnauthorizedException('Token invalido');
    return info;
  }

  @Post('/check-permission')
  async checkPermission(@Body() body: PermissionCheckDTO) {
    const info = await this.authService.verifyToken(body.token);
    if (!info) return { allowed: false, message: 'Token invalido' };
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
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission('Users', 'update')
  @Post('/unlock-user')
  async unlockUser(@Body('email') email: string) {
    if (!email) throw new UnauthorizedException('Email requerido');
    await this.authService.unlockUser(email);
    return { message: `Usuario ${email} desbloqueado` };
  }

  // Admin: get locked users
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission('Users', 'read')
  @Get('/locked-users')
  async getLockedUsers() {
    return this.authService.getLockedUsers();
  }

  // Admin: unblock a user by email param
  @Post('unblock/:email')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission('Users', 'update')
  async unblockUser(@Param('email') email: string) {
    await this.authService.clearAttempts(email);
    return { message: `Usuario ${email} desbloqueado exitosamente.` };
  }

  @Post('/firebase-sync')
  async firebaseSync(@Body('firebaseToken') firebaseToken: string) {
    if (!firebaseToken) {
      throw new UnauthorizedException('Firebase token requerido');
    }
    return await this.authService.firebaseSync(firebaseToken);
  }
}
