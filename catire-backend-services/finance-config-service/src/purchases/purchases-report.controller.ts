import PDFDocument from 'pdfkit';
import { UseGuards, Controller, Get, Res } from '@nestjs/common';
import { PermissionGuard } from 'src/auth/permission.guard';
import { RemoteAuthGuard } from 'src/auth/remote-auth.guard';
import { PurchasesService } from './purchases.service';
import { Purchase } from '@prisma/client';
import { CheckPermission } from 'src/auth/permission.decorator';
import { type Response } from 'express';

@UseGuards(RemoteAuthGuard, PermissionGuard)
@Controller('purchases')
export class PurchasesReportController {
  constructor(private service: PurchasesService) {}

  @Get('report')
  @CheckPermission('Purchases', 'read')
  async report(@Res() res: Response): Promise<void> {
    const purchases = await this.service.findAll();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=purchases-report.pdf',
    );

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text('Purchases Report', { align: 'center' });
    doc.moveDown();

    purchases.forEach((p: Purchase) => {
      doc.fontSize(12).text(`ID: ${p.id}`);
      doc.text(`Order ID: ${p.order_id}`);
      doc.text(`Base: ${p.purchase_base.toString()}`);
      doc.text(`Additional: ${p.purchase_additional.toString()}`);
      doc.text(`Total: ${p.purchase_total.toString()}`);
      if (p.notes) doc.text(`Notes: ${p.notes}`);
      doc.moveDown();
    });

    doc.end();
  }
}
