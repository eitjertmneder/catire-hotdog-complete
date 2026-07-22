import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'src/types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Match the generic signature of the base IAuthGuard
  handleRequest<TUser>(
    err: any,
    user: User,
    info: any,
    context: ExecutionContext,
  ): TUser {
    if (err) throw err;

    const req: Request = context.switchToHttp().getRequest();
    const header = String(req.headers?.authorization || '');

    if (!user) {
      // Provide clearer messages depending on whether a token was provided
      if (!header || !header.startsWith('Bearer ')) {
        throw new UnauthorizedException('Token no proporcionado');
      }
      throw new UnauthorizedException('Token inválido');
    }

    return user as TUser;
  }
}
