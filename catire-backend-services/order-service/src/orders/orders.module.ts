import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersReportController } from './orders-report.controller';
import { ImageStorageModule } from '../image-storage/image-storage.module';

@Module({
  imports: [ImageStorageModule],
  providers: [OrdersService],
  controllers: [OrdersReportController, OrdersController],
})
export class OrdersModule {}
