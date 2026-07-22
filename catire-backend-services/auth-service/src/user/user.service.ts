import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserRole } from 'src/types/user';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(body: CreateUserDto): Promise<User | null> {
    try {
      const salts = await bcrypt.genSalt();
      const hash = await bcrypt.hash(body.password, salts);

      const newUser = await this.prisma.user.create({
        data: {
          ...body,
          password: hash,
          role_id: !body.role_id ? 1 : body.role_id,
        },
        include: { role: true },
      });

      return newUser;
    } catch (error: unknown) {
      if (error instanceof Error) console.error('ERROR: ', error.message);
      else console.error('ERROR: ', error);
      return null;
    }
  }

  async findOneUser(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email, deleted_at: null },
        include: { role: true },
      });
      return user;
    } catch (error: unknown) {
      if (error instanceof Error) console.error('ERROR: ', error.message);
      else console.error('ERROR: ', error);
      return null;
    }
  }

  async getUserById(id: number): Promise<UserRole | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id, deleted_at: null },
        include: { role: true },
      });
      return user;
    } catch (error: unknown) {
      if (error instanceof Error) console.error('ERROR: ', error.message);
      else console.error('ERROR: ', error);
      return null;
    }
  }

  async findAllUsers(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany({
        where: { deleted_at: null },
        include: { role: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error) console.error('ERROR: ', error.message);
      else console.error('ERROR: ', error);
      return [];
    }
  }

  async updateUser(id: number, data: UpdateUserDTO): Promise<User | null> {
    try {
      let newPassword = data.password;
      if (data.password) {
        const salts = await bcrypt.genSalt();
        newPassword = await bcrypt.hash(data.password, salts);
      }

      const updated = await this.prisma.user.update({
        where: { id },
        data: { ...data, password: newPassword } as User,
        include: { role: true },
      });

      return updated;
    } catch (error: unknown) {
      if (error instanceof Error) console.error('ERROR: ', error.message);
      else console.error('ERROR: ', error);
      return null;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // Soft delete: establecer deleted_at en lugar de eliminar
      await this.prisma.user.update({
        where: { id },
        data: { deleted_at: new Date() },
      });
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) console.error('ERROR: ', error.message);
      else console.error('ERROR: ', error);
      return false;
    }
  }
}


