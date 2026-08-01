import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    type: string;
    action: string;
    description: string;
    user_email?: string;
    user_id?: number;
    branch_id?: number;
    severity?: string;
    metadata?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        ...data,
        severity: data.severity || 'info',
      },
    });
  }

  async findAll(limit = 50, type?: string) {
    const where = type ? { type } : {};
    return this.prisma.auditLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  async getStats() {
    const total = await this.prisma.auditLog.count();
    const byType = await this.prisma.auditLog.groupBy({
      by: ['type'],
      _count: true,
    });
    return { total, byType };
  }
}
