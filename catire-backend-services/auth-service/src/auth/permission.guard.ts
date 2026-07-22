import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from './permission.decorator';
import { PermissionMetadata } from '../types/permissions';
import { Request } from '../types';
import { AuthService } from './auth.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.get<PermissionMetadata>(
      PERMISSION_KEY,
      context.getHandler(),
    );
    if (!metadata) return true;

    const { module, action } = metadata;
    const req: Request = context.switchToHttp().getRequest();

    // extract token from header or body
    const header = String(req.headers?.authorization || '');
    let token = '';
    if (header && header.startsWith('Bearer ')) token = header.slice(7);

    if (!token) throw new UnauthorizedException('Token no proporcionado');

    const info = await this.authService.verifyToken(token);
    if (!info) throw new UnauthorizedException('Token inválido');

    const role = info.role;
    if (!role || !role.permissions_json) {
      throw new ForbiddenException(
        'Acceso denegado: El usuario no tiene un rol válido',
      );
    }

    const perms = role.permissions_json as Record<string, string[]>;
    const modulePerms = perms[module];

    const allowed = Array.isArray(modulePerms) && modulePerms.includes(action);
    if (allowed) {
      // attach user to request for handlers
      req.user = info;
      return true;
    }

    throw new ForbiddenException('Acceso denegado: No tienes permiso para esta acción');
  }
}
