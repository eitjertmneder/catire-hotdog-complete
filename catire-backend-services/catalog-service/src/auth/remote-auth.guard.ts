import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { Request } from '../types/request';
import { User } from '../types/user';

interface Response {
  user: User;
  token: string;
}

export async function validateRequestToken(req: Request): Promise<Response> {
  const header = String(req.headers?.authorization || '');
  let token: string | undefined = undefined;
  if (header && header.startsWith('Bearer ')) token = header.slice(7);

  if (!token) throw new UnauthorizedException('El token es requerido');

  const authUrl = process.env.AUTH_SERVICE_URL;

  try {
    const res = await axios.post<User>(`${authUrl}/validate`, { token });
    if (!res.data) throw new UnauthorizedException('Token inválido');
    return {
      user: res.data,
      token,
    };
  } catch {
    throw new UnauthorizedException('Token inválido');
  }
}

@Injectable()
export class RemoteAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    const { user } = await validateRequestToken(req);
    req.user = user;
    return true;
  }
}
