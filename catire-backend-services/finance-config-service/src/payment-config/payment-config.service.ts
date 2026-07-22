import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentConfig } from '@prisma/client';
import { CreatePaymentConfigDTO } from './dto/create-payment-config.dto';
import { UpdatePaymentConfigDTO } from './dto/update-payment-config.dto';

@Injectable()
export class PaymentConfigService {
  constructor(private prisma: PrismaService) {}

  async getActive(): Promise<PaymentConfig | null> {
    return await this.prisma.paymentConfig.findFirst({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findAll(): Promise<PaymentConfig[]> {
    return await this.prisma.paymentConfig.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async create(data: CreatePaymentConfigDTO): Promise<PaymentConfig> {
    // Desactivar todas las configs anteriores
    await this.prisma.paymentConfig.updateMany({
      where: { is_active: true },
      data: { is_active: false },
    });

    // Crear nueva config activa
    return await this.prisma.paymentConfig.create({
      data: {
        holder_name: data.holder_name,
        holder_dni: data.holder_dni,
        phone: data.phone,
        bank: data.bank,
        is_active: true,
      },
    });
  }

  async update(id: string, data: UpdatePaymentConfigDTO): Promise<PaymentConfig> {
    const config = await this.prisma.paymentConfig.findUnique({ where: { id } });
    if (!config) throw new NotFoundException('Configuración de pago no encontrada');

    return await this.prisma.paymentConfig.update({
      where: { id },
      data,
    });
  }
}