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

    this.$extends({
      query: {
        $allModels: {
          delete({ model, args }) {
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
