import { Module } from '@nestjs/common';
import { PaymentConfigService } from './payment-config.service';
import { PaymentConfigController } from './payment-config.controller';

@Module({
  imports: [],
  providers: [PaymentConfigService],
  controllers: [PaymentConfigController],
})
export class PaymentConfigModule {}
