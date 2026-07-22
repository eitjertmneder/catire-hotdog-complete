import axios from 'axios';
import PDFDocument from 'pdfkit';
import { UseGuards, Controller, Get, Res, Request } from '@nestjs/common';
import { PermissionGuard } from 'src/auth/permission.guard';
import { RemoteAuthGuard } from 'src/auth/remote-auth.guard';
import { OrdersService } from './orders.service';
import { CheckPermission } from 'src/auth/permission.decorator';
import { type Request as TypedRequest } from '../types/request';
import { type Response } from 'express';
import { Product } from './types/Product';
import { AddressDTO } from './dto/create-order.dto';

@UseGuards(RemoteAuthGuard, PermissionGuard)
@Controller('orders')
export class OrdersReportController {
  constructor(private service: OrdersService) {}

  @Get('report')
  @UseGuards(PermissionGuard)
  @CheckPermission('Orders', 'read')
  async report(
    @Request() req: TypedRequest,
    @Res() res: Response,
  ): Promise<void> {
    const orders = await this.service.findAll(
      req.headers.authorization || '',
      req.user,
    );

    const catalogUrl = process.env.CATALOG_SERVICE_URL;
    const requests: Array<Promise<CatalogResponse>> = [];

    type CatalogResponse = {
      orderId: string;
      itemId: string;
      product: Product | null;
    };

    for (const o of orders) {
      for (const it of o.items || []) {
        requests.push(
          axios
            .get<Product>(`${catalogUrl}/products/${it.product_id}`, {
              headers: { authorization: req.headers?.authorization || '' },
            })
            .then((r) => ({
              orderId: o.id,
              itemId: it.id,
              product: r.data,
            }))
            .catch(() => ({ orderId: o.id, itemId: it.id, product: null })),
        );
      }
    }

    const results: CatalogResponse[] = await Promise.all(requests);
    const productsByOrder: Record<string, CatalogResponse[]> = {};
    for (const r of results) {
      productsByOrder[r.orderId] = productsByOrder[r.orderId] || [];
      productsByOrder[r.orderId].push(r);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=orders-report.pdf',
    );

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text('Reporte de pedidos', { align: 'center' });
    doc.moveDown();

    for (const o of orders) {
      doc.fontSize(12).text(`ID de pedido: ${o.id}`);
      doc.fontSize(12).text(`Productos:`);
      const items = o.items || [];
      for (const it of items) {
        const found = (productsByOrder[o.id] || []).find(
          (p) => p.itemId === it.id,
        );
        const qty = typeof it.quantity === 'number' ? it.quantity : 1;
        if (found && found.product) {
          const lineTotal = (found.product.base_price || 0) * qty;
          doc.text(
            `- ${found.product.name} (x${qty}) - ${lineTotal.toFixed(2)}`,
          );
        } else {
          doc.text(`- Producto ID: ${it.product_id} (x${qty}) - N/A`);
        }
      }
      doc.text(`Es Delivery: ${o.is_delivery ? 'Sí' : 'No'}`);

      if (o.is_delivery) {
        doc.text(`Dirección: `);
        doc.text(`- Calle: ${(o.address as AddressDTO).street}`);
        doc.text(`- Carrera: ${(o.address as AddressDTO).avenue}`);
        doc.text(`- Número de casa: ${(o.address as AddressDTO).house_number}`);
        doc.text(
          `- Referencia: ${(o.address as AddressDTO).reference || 'N/A'}`,
        );
      }
      if (o.notes) doc.text(`Notas: ${o.notes}`);
      doc.moveDown();
    }

    doc.end();
  }
}
