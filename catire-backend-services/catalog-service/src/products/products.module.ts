import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsReportController } from './products-report.controller';
@Module({
  imports: [],
  providers: [ProductsService],
  controllers: [ProductsReportController, ProductsController],
})
export class ProductsModule {}
