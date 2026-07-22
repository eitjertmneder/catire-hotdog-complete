import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { PurchasesReportController } from './purchases-report.controller';
@Module({
  imports: [],
  providers: [PurchasesService],
  controllers: [PurchasesReportController, PurchasesController],
})
export class PurchasesModule {}
