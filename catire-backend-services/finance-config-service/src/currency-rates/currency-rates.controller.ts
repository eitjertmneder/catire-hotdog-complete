import {
  Controller,
  Get,
  Body,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrencyRatesService } from './currency-rates.service';
import { UpdateRatesDTO } from './dto/update-rates.dto';
import { CurrencyRate } from '@prisma/client';
import { CheckPermission } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/permission.guard';
import { RemoteAuthGuard } from '../auth/remote-auth.guard';

@Controller('currency-rates')
export class CurrencyRatesController {
  constructor(private service: CurrencyRatesService) {}

  @Get()
  async getRates(): Promise<CurrencyRate> {
    return await this.service.getRates();
  }

  @Get('api-info')
  async getAPIInfo(): Promise<{ oficial: number; paralelo: number; fecha: string }> {
    return await this.service.fetchFromAPI();
  }

  @Post('sync')
  @UseGuards(RemoteAuthGuard, PermissionGuard)
  @CheckPermission('Purchases', 'update')
  async syncFromAPI(): Promise<CurrencyRate> {
    return await this.service.syncFromAPI();
  }

  @Patch()
  @UseGuards(RemoteAuthGuard, PermissionGuard)
  @CheckPermission('Purchases', 'update')
  async updateRates(@Body() body: UpdateRatesDTO): Promise<CurrencyRate> {
    return await this.service.updateRates(body);
  }
}