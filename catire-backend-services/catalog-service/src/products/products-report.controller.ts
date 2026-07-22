import PDFDocument from 'pdfkit';
import { UseGuards, Controller, Get, Res } from '@nestjs/common';
import { PermissionGuard } from 'src/auth/permission.guard';
import { RemoteAuthGuard } from 'src/auth/remote-auth.guard';
import { ProductsService } from './products.service';
import { CheckPermission } from 'src/auth/permission.decorator';
import { type Response } from 'express';

@UseGuards(RemoteAuthGuard, PermissionGuard)
@Controller('products')
export class ProductsReportController {
  constructor(private service: ProductsService) {}

  @Get('report')
  @UseGuards(PermissionGuard)
  @CheckPermission('Products', 'read')
  async report(@Res() res: Response) {
    const products = await this.service.findAll();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=products-report.pdf',
    );

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text('Reporte de productos', { align: 'center' });
    doc.moveDown();

    products.forEach((p) => {
      doc.fontSize(12).text(`Producto: ${p.id} - ${p.name}`);
      doc.text(`Categoria: ${p.category.name}`);
      doc.moveDown();
    });

    doc.end();
  }
}
