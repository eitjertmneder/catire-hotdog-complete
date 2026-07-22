import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PaymentConfigService } from './payment-config.service';
import { CreatePaymentConfigDTO } from './dto/create-payment-config.dto';
import { UpdatePaymentConfigDTO } from './dto/update-payment-config.dto';
import { PaymentConfig } from '@prisma/client';
import { CheckPermission } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/permission.guard';
import { RemoteAuthGuard } from '../auth/remote-auth.guard';

@Controller('payment-config')
export class PaymentConfigController {
  constructor(private service: PaymentConfigService) {}

  // Público - cualquier usuario puede ver la config activa
  @Get('active')
  async getActive(): Promise<PaymentConfig | null> {
    return await this.service.getActive();
  }

  // Solo admin puede ver todas las configs
  @Get()
  @UseGuards(RemoteAuthGuard, PermissionGuard)
  @CheckPermission('Purchases', 'read')
  async findAll(): Promise<PaymentConfig[]> {
    return await this.service.findAll();
  }

  // Solo admin puede crear nueva config
  @Post()
  @UseGuards(RemoteAuthGuard, PermissionGuard)
  @CheckPermission('Purchases', 'create')
  async create(@Body() body: CreatePaymentConfigDTO): Promise<PaymentConfig> {
    return await this.service.create(body);
  }

  // Solo admin puede actualizar config
  @Patch(':id')
  @UseGuards(RemoteAuthGuard, PermissionGuard)
  @CheckPermission('Purchases', 'update')
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePaymentConfigDTO,
  ): Promise<PaymentConfig> {
    return await this.service.update(id, body);
  }
}
