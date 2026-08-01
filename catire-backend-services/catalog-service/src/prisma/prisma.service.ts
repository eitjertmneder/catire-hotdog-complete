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

    Object.assign(
      this,
      (this as any).$extends({
        query: {
          $allModels: {
            delete({ model, args }: { model: string; args: any }) {
              return (this as any)[model].update({
                where: args.where,
                data: { deleted_at: new Date() },
              });
            },
            deleteMany({ model, args }: { model: string; args: any }) {
              return (this as any)[model].updateMany({
                where: args.where,
                data: { deleted_at: new Date() },
              });
            },
          },
        },
      }),
    );
  }

  async onModuleInit() {
    await this.$connect();
  }
}
