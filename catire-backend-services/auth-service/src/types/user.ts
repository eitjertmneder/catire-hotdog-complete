import { Role, User } from '@prisma/client/edge';

export interface UserRole extends User {
  role: Role | null;
}
