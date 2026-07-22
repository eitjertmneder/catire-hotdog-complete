import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { type Response } from 'express';
import { User } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { CheckPermission } from '../auth/permission.decorator';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('users')
export class UsersReportController {
  constructor(private prisma: PrismaService) {}

  @Get('report')
  @CheckPermission('Users', 'read')
  async report(@Res() res: Response) {
    const users = (await this.prisma.user.findMany({
      include: { role: true },
    })) as Array<
      User & {
        role?: {
          id?: number;
          name?: string;
        } | null;
      }
    >;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=users-report.pdf',
    );

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text('Reporte de Usuarios', { align: 'center' });
    doc.moveDown();

    users.forEach((u) => {
      doc.fontSize(12).text(`ID: ${u.id}`);
      doc.text(`Nombre: ${u.full_name ?? ''}`);
      doc.text(`Correo: ${u.email ?? ''}`);
      doc.text(`Rol: ${u.role?.name ?? ''}`);
      doc.moveDown();
    });

    doc.end();
  }
}
