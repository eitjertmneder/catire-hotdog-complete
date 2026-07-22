import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();

    this.$extends({
      query: {
        order: {
          delete({ model, args }) {
            return (this as any)[model].update({
              where: args.where,
              data: { deleted_at: new Date() },
            });
          },
          deleteMany({ model, args }) {
            return (this as any)[model].update({
              where: args.where,
              data: { deleted_at: new Date() },
            });
          },
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}