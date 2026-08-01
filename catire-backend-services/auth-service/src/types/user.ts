import { Role, User } from '@prisma/client';

export interface UserRole extends User {
  role: Role | null;
}
