import { User } from './user';
import { Request as ExpressRequest } from 'express';

export interface Request extends ExpressRequest {
  user: User;
}
