import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageStorageService } from '../image-storage/image-storage.service';
import { AuditService } from '../audit/audit.service';
import { CreateOrderDTO, CreateOrderItemDTO } from './dto/create-order.dto';
import { UpdateOrderDTO } from './dto/update-order.dto';
import axios from 'axios';
import { Prisma } from '@prisma/client';
import { Product } from './types/Product';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private imageStorage: ImageStorageService,
    private auditService: AuditService,
  ) {}

  async findAll(token: string, user?: any) {
    // If user is an employee (cajero), only return orders from their branch
    const where: any = {};
    if (user && user.role?.name === 'employee' && user.branch_id) {
      where.branch_id = user.branch_id;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { created_at: 'desc' },
    });

    // Fetch user information for each order using internal endpoint (no auth required)
    const authUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        try {
          if (order.user_id) {
            const userRes = await axios.get(`${authUrl}/users/internal/${order.user_id}`);
            return { ...order, user: userRes.data };
          }
        } catch (e) {
          // If user fetch fails, return order without user info
        }
        return { ...order, user: null };
      })
    );

    return ordersWithUsers;
  }

  async findByBranch(branchId: number, token: string) {
    const orders = await this.prisma.order.findMany({
      where: { branch_id: branchId },
      include: { items: true },
      orderBy: { created_at: 'desc' },
    });
    return orders;
  }

  async findOne(id: string, token?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  async create(data: CreateOrderDTO, token: string, userId: number) {
    // Save payment proof image if provided
    let paymentProofUrl = data.payment_proof;
    if (data.payment_proof && data.payment_proof.startsWith('data:image')) {
      try {
        paymentProofUrl = await this.imageStorage.saveImage(data.payment_proof, `order_${Date.now()}`);
      } catch (error) {
        console.error('Error saving payment proof image:', error);
      }
    }

    // Create order in MongoDB
    const order = await this.prisma.order.create({
      data: {
        user_id: userId,
        branch_id: data.branch_id,
        is_delivery: data.is_delivery,
        payment_method: data.payment_method,
        payment_proof: paymentProofUrl,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            base_price: item.base_price,
            features: item.features as any[] || [],
          })),
        },
      },
      include: { items: true },
    });

    return order;
  }

  async update(id: string, data: UpdateOrderDTO, token: string, user?: any) {
    const existingOrder = await this.findOne(id);

    // Validate that employees can only update orders from their branch
    if (user && user.role?.name === 'employee') {
      if (existingOrder.branch_id !== user.branch_id) {
        throw new ForbiddenException('No puedes aprobar ordenes de otra sucursal');
      }
    }

    // Update order
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: data as any,
      include: { items: true },
    });

    // Handle stock deduction when status changes to PAID (cajero approves)
    if (existingOrder.status !== 'PAID' && updatedOrder.status === 'PAID') {
      await this.deductStockForOrder(updatedOrder, updatedOrder.branch_id || 0, token);
    }

    // Audit logging for status changes
    if (existingOrder.status !== updatedOrder.status) {
      const auditData = {
        user_email: user?.email,
        user_id: user?.id,
        branch_id: updatedOrder.branch_id || undefined,
        metadata: { order_id: id, previous_status: existingOrder.status, new_status: updatedOrder.status },
      };

      if (updatedOrder.status === 'PAID') {
        await this.auditService.log({
          type: 'order_change',
          action: 'order_paid',
          description: `Orden #${id} marcada como pagada`,
          severity: 'success',
          ...auditData,
        });
      } else if (updatedOrder.status === 'CANCELLED') {
        await this.auditService.log({
          type: 'order_change',
          action: 'order_cancelled',
          description: `Orden #${id} cancelada${updatedOrder.cancel_reason ? `: ${updatedOrder.cancel_reason}` : ''}`,
          severity: 'warning',
          ...auditData,
        });
      } else if (updatedOrder.status === 'DELIVERED') {
        await this.auditService.log({
          type: 'order_change',
          action: 'order_delivered',
          description: `Orden #${id} marcada como entregada`,
          severity: 'success',
          ...auditData,
        });
      }
    }

    return updatedOrder;
  }

  async remove(id: string) {
    const order = await this.findOne(id);

    await this.prisma.orderDetails.deleteMany({ where: { order_id: id } });
    return this.prisma.order.delete({ where: { id } });
  }

  private normalizeForMatch(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');
  }

  private async deductStockForOrder(order: any, branchId: number, token: string) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const catalogUrl = process.env.CATALOG_SERVICE_URL;
        const ingredientsRes = await axios.get(
          `${catalogUrl}/ingredients/internal/by-branch?branch_id=${branchId}`,
          { headers: { authorization: token } },
        );
        const ingredients = ingredientsRes.data;

        const itemsToDeduct: { ingredient_id: number; quantity: number }[] = [];

        for (const orderItem of order.items) {
          if (orderItem.features && Array.isArray(orderItem.features)) {
            for (const feature of orderItem.features) {
              if (!feature.value) continue;
              const values = feature.value.split(',');
              for (const val of values) {
                const trimmed = val.trim();
                if (!trimmed) continue;
                const ingredient = ingredients.find(
                  (ing: any) => ing.name_tag === feature.name_tag && ing.name.toLowerCase() === trimmed.toLowerCase()
                ) || ingredients.find(
                  (ing: any) => ing.name_tag === feature.name_tag && this.normalizeForMatch(ing.name) === this.normalizeForMatch(trimmed)
                ) || ingredients.find(
                  (ing: any) => ing.name_tag === feature.name_tag && (
                    ing.name.toLowerCase().includes(trimmed.toLowerCase()) ||
                    trimmed.toLowerCase().includes(ing.name.toLowerCase())
                  )
                );
                if (ingredient) {
                  itemsToDeduct.push({ ingredient_id: ingredient.id, quantity: orderItem.quantity });
                } else {
                  console.warn(`No ingredient match for feature: name_tag=${feature.name_tag}, value="${trimmed}"`);
                }
              }
            }
          }
        }

        if (itemsToDeduct.length > 0) {
          console.log(`Deducting ${itemsToDeduct.length} ingredients for order ${order.id}`);
          await axios.post(`${catalogUrl}/ingredients/internal/batch-deduct`, { items: itemsToDeduct }, { headers: { authorization: token } });
          return;
        }
      } catch (error) {
        console.error(`Error deducting stock for order ${order.id} (attempt ${attempt}/${MAX_RETRIES}):`, error);
        if (attempt < MAX_RETRIES) await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
  }
}
