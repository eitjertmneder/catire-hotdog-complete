import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PurchasesModule } from './purchases/purchases.module';
import { CurrencyRatesModule } from './currency-rates/currency-rates.module';
import { PaymentConfigModule } from './payment-config/payment-config.module';

@Module({
  imports: [PrismaModule, PurchasesModule, CurrencyRatesModule, PaymentConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
