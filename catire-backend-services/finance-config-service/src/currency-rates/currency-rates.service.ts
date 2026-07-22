import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CurrencyRate } from '@prisma/client';
import { UpdateRatesDTO } from './dto/update-rates.dto';
import axios from 'axios';

@Injectable()
export class CurrencyRatesService {
  private readonly logger = new Logger(CurrencyRatesService.name);
  private readonly DOLAR_API_URL = 'https://ve.dolarapi.com/v1/dolares';

  constructor(private prisma: PrismaService) {}

  async getRates(): Promise<CurrencyRate> {
    let rate = await this.prisma.currencyRate.findFirst({
      orderBy: { last_updated: 'desc' },
    });

    if (!rate) {
      rate = await this.prisma.currencyRate.create({
        data: {
          rate_usd: 1,
          rate_cop: 4000,
          rate_bs: 800,
        },
      });
    }

    return rate;
  }

  async fetchFromAPI(): Promise<{ oficial: number; paralelo: number; fecha: string }> {
    try {
      const response = await axios.get(this.DOLAR_API_URL);
      const dolares = response.data;

      const oficial = dolares.find((d: any) => d.fuente === 'oficial');
      const paralelo = dolares.find((d: any) => d.fuente === 'paralelo');

      return {
        oficial: oficial?.promedio || 0,
        paralelo: paralelo?.promedio || 0,
        fecha: paralelo?.fechaActualizacion || new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching from dolarapi.com', error);
      throw new Error('No se pudieron obtener las tasas desde la API');
    }
  }

  async syncFromAPI(): Promise<CurrencyRate> {
    const apiData = await this.fetchFromAPI();

    const existing = await this.prisma.currencyRate.findFirst({
      orderBy: { last_updated: 'desc' },
    });

    const data = {
      rate_usd: 1,
      rate_bs: apiData.paralelo,
      rate_cop: existing?.rate_cop || 4000,
    };

    if (existing) {
      return await this.prisma.currencyRate.update({
        where: { id: existing.id },
        data,
      });
    } else {
      return await this.prisma.currencyRate.create({ data });
    }
  }

  async updateRates(data: UpdateRatesDTO): Promise<CurrencyRate> {
    const existing = await this.prisma.currencyRate.findFirst({
      orderBy: { last_updated: 'desc' },
    });

    if (existing) {
      return await this.prisma.currencyRate.update({
        where: { id: existing.id },
        data: {
          rate_cop: data.rate_cop,
          rate_bs: data.rate_bs,
        },
      });
    } else {
      return await this.prisma.currencyRate.create({
        data: {
          rate_usd: 1,
          rate_cop: data.rate_cop,
          rate_bs: data.rate_bs,
        },
      });
    }
  }
}