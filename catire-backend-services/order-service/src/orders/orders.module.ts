import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersReportController } from './orders-report.controller';
@Module({
  imports: [],
  providers: [OrdersService],
  controllers: [OrdersReportController, OrdersController],
})
export class OrdersModule {}
