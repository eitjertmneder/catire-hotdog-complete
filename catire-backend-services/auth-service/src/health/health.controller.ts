import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: await this.checkDatabase(),
        memory: this.checkMemory(),
        uptime: process.uptime(),
      },
    };

    return checks;
  }

  @Get('ready')
  async readiness() {
    const dbStatus = await this.checkDatabase();
    return {
      status: dbStatus.status === 'ok' ? 'ready' : 'not_ready',
      database: dbStatus,
    };
  }

  @Get('live')
  liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', message: 'Database connected' };
    } catch (error) {
      return { status: 'error', message: 'Database connection failed' };
    }
  }

  private checkMemory() {
    const memUsage = process.memoryUsage();
    return {
      status: 'ok',
      rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
    };
  }
}
