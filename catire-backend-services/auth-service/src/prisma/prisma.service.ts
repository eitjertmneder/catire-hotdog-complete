import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: process.env['DATABASE_URL']!,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  // Soft delete helper - use this instead of direct delete
  async softDelete(model: string, where: any) {
    return (this as any)[model].update({
      where,
      data: { deleted_at: new Date() },
    });
  }

  // Soft delete many helper
  async softDeleteMany(model: string, where: any) {
    return (this as any)[model].updateMany({
      where,
      data: { deleted_at: new Date() },
    });
  }
}
