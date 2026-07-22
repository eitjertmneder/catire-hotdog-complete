import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageStorageService } from '../image-storage/image-storage.service';
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
  ) {}

  async findAll(token: string, user?: any) {
    const orders = await this.prisma.order.findMany({
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

  async update(id: string, data: UpdateOrderDTO, token: string) {
    const existingOrder = await this.findOne(id);
    
    // Update order
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: data as any,
      include: { items: true },
    });

    // Handle stock deduction when status changes to PAID
    if (existingOrder.status !== 'PAID' && updatedOrder.status === 'PAID') {
      await this.deductStockForOrder(updatedOrder, updatedOrder.branch_id || 0, token);
    }

    // Handle stock restoration when status changes to CANCELLED
    if (existingOrder.status !== 'CANCELLED' && updatedOrder.status === 'CANCELLED') {
      await this.restoreStockForOrder(updatedOrder, updatedOrder.branch_id || 0, token);
    }

    return updatedOrder;
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    
    // Restore stock if order was paid
    if (order.status === 'PAID' || order.status === 'PREPARING' || order.status === 'READY') {
      await this.restoreStockForOrder(order, order.branch_id || 0, '');
    }

    await this.prisma.orderDetails.deleteMany({ where: { order_id: id } });
    return this.prisma.order.delete({ where: { id } });
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
                  (ing: any) => ing.name_tag === feature.name_tag && ing.name.toLowerCase().includes(trimmed.toLowerCase())
                );
                if (ingredient) {
                  itemsToDeduct.push({ ingredient_id: ingredient.id, quantity: orderItem.quantity });
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

  private async restoreStockForOrder(order: any, branchId: number, token: string) {
    try {
      const catalogUrl = process.env.CATALOG_SERVICE_URL;
      const ingredientsRes = await axios.get(`${catalogUrl}/ingredients/internal/by-branch?branch_id=${branchId}`, { headers: { authorization: token } });
      const ingredients = ingredientsRes.data;

      const itemsToRestock: { ingredient_id: number; quantity: number }[] = [];

      for (const orderItem of order.items) {
        if (orderItem.features && Array.isArray(orderItem.features)) {
          for (const feature of orderItem.features) {
            if (!feature.value) continue;
            const values = feature.value.split(',');
            for (const val of values) {
              const trimmed = val.trim();
              if (!trimmed) continue;
              const ingredient = ingredients.find(
                (ing: any) => ing.name_tag === feature.name_tag && ing.name.toLowerCase().includes(trimmed.toLowerCase())
              );
              if (ingredient) {
                itemsToRestock.push({ ingredient_id: ingredient.id, quantity: orderItem.quantity });
              }
            }
          }
        }
      }

      if (itemsToRestock.length > 0) {
        await axios.post(`${catalogUrl}/ingredients/internal/batch-restock`, { items: itemsToRestock }, { headers: { authorization: token } });
      }
    } catch (error) {
      console.error(`Error restoring stock for order ${order.id}:`, error);
    }
  }
}



