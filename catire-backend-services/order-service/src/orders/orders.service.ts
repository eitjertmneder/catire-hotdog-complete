import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateOrderDTO, CreateOrderItemDTO } from './dto/create-order.dto';
import { UpdateOrderDTO } from './dto/update-order.dto';
import { User } from 'src/types/user';
import axios from 'axios';

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true };
}>;

export type OrderWithUser = OrderWithItems & {
  user: User | null;
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(token: string, user?: User): Promise<OrderWithUser[]> {
    let orders: OrderWithItems[];

    if (user && user.role.name === 'client') {
      orders = await this.prisma.order.findMany({
        where: { user_id: user.id },
        include: { items: true },
        orderBy: { created_at: 'desc' },
      });
    } else if (user && user.role.name === 'employee') {
      const workerProfile = await this.getUser(user.id, token).catch(() => null);
      const branchId = workerProfile?.branch_id;
      if (branchId) {
        orders = await this.prisma.order.findMany({
          where: { branch_id: branchId },
          include: { items: true },
          orderBy: { created_at: 'desc' },
        });
      } else {
        orders = await this.prisma.order.findMany({
          include: { items: true },
          orderBy: { created_at: 'desc' },
        });
      }
    } else {
      orders = await this.prisma.order.findMany({
        include: { items: true },
        orderBy: { created_at: 'desc' },
      });
    }

    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        const user = await this.getUser(order.user_id, token).catch(() => null);
        return { ...order, user };
      }),
    );

    return ordersWithUsers;
  }

  async findOne(
    id: string,
    token: string,
    user?: User,
  ): Promise<OrderWithUser | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return null;
    if (user && user.role.name === 'client' && order.user_id !== user.id)
      return null;

    const userData = await this.getUser(order.user_id, token).catch(() => null);

    return { ...order, user: userData };
  }

  async create(
    data: CreateOrderDTO,
    token: string,
    user_id: number,
  ): Promise<Prisma.OrderGetPayload<{ include: { items: true } }>> {
    // Duplicate order prevention: check for identical orders within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentOrders = await this.prisma.order.findMany({
      where: {
        user_id,
        branch_id: data.branch_id,
        created_at: { gte: fiveMinutesAgo },
        status: { not: 'CANCELLED' },
      },
      include: { items: true },
    });

    if (data.items && data.items.length > 0) {
      const newSignature = this.getOrderSignature(data.items);
      for (const recent of recentOrders) {
        const recentSignature = this.getOrderSignature(
          recent.items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        );
        if (newSignature === recentSignature) {
          throw new ConflictException(
            'Pedido repetido: ya existe un pedido idéntico en los últimos 5 minutos.',
          );
        }
      }
    }

    const { items, ...rest } = data;
    const createData: Prisma.OrderCreateInput = { ...rest, user_id };

    if (items && Array.isArray(items) && items.length > 0) {
      const sanitized = await this.getValidateItems(items, token);
      createData.items = { create: sanitized };
    }

    return await this.prisma.order.create({
      data: createData,
      include: { items: true },
    });
  }

  async update(
    id: string,
    data: UpdateOrderDTO,
    token: string,
    worker?: User,
  ): Promise<Prisma.OrderGetPayload<{ include: { items: true } }>> {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      throw new NotFoundException(`Orden con ID ${id} no encontrada.`);
    }

    const { items, ...rest } = data;
    const updateData: Prisma.OrderUpdateInput = { ...rest };

    if (items && Array.isArray(items) && items.length > 0) {
      const sanitized = await this.getValidateItems(items, token);
      updateData.items = { create: sanitized };
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    // Stock deduction: deduct ONLY when cajero approves (status → PAID)
    if (
      existingOrder.status !== 'PAID' &&
      updatedOrder.status === 'PAID'
    ) {
      const branchId =
        updatedOrder.branch_id || (worker ? (await this.getUser(worker.id, token).catch(() => null))?.branch_id : null);
      if (branchId) {
        console.log(
          `Cajero aprobó orden ${id} - descontando stock de sucursal ${branchId}`,
        );
        await this.deductStockForOrder(updatedOrder, branchId, token);
      } else {
        console.log(`Orden ${id} aprobada pero sin branch_id - no se descuenta stock`);
      }
    }

    // Stock restoration: restore when order is cancelled
    if (
      existingOrder.status !== 'CANCELLED' &&
      updatedOrder.status === 'CANCELLED'
    ) {
      const branchId =
        updatedOrder.branch_id || (worker ? (await this.getUser(worker.id, token).catch(() => null))?.branch_id : null);
      if (branchId) {
        console.log(
          `Orden ${id} cancelada - restaurando stock de sucursal ${branchId}`,
        );
        await this.restoreStockForOrder(updatedOrder, branchId, token);
      }
    }

    return updatedOrder;
  }

  async remove(id: string) {
    await this.prisma.orderDetails.deleteMany({
      where: { order_id: id },
    });

    return this.prisma.order.delete({
      where: { id },
      include: { items: true },
    });
  }

  async getValidateItems(
    items: CreateOrderItemDTO[],
    token: string,
  ): Promise<any[]> {
    const sanitized = items.map(
      async (it): Promise<CreateOrderItemDTO | undefined> => {
        try {
          const product = await axios.get(
            `${process.env.CATALOG_SERVICE_URL}/products/${it.product_id}`,
            { headers: { authorization: token } },
          );
          if (!product) {
            throw new NotFoundException(
              `Producto con ID ${it.product_id} no encontrado.`,
            );
          }
          return {
            product_id: it.product_id,
            quantity: typeof it.quantity === 'number' ? it.quantity : 1,
            base_price: it.base_price,
            features: it.features,
          };
        } catch (err) {
          console.log(err);
          throw new NotFoundException(
            `Producto con ID ${it.product_id} no encontrado.`,
          );
        }
      },
    );

    return await Promise.all(sanitized);
  }

  async getUser(user_id: number, token: string) {
    try {
      const res = await axios.get<User>(
        `${process.env.AUTH_SERVICE_URL}/users/${user_id}`,
        { headers: { authorization: token } },
      );
      const user = res.data;

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${user_id} no encontrado.`);
      }

      return user;
    } catch (error) {
      console.log(error);
      throw new NotFoundException(`Usuario con ID ${user_id} no encontrado.`);
    }
  }

  private getOrderSignature(
    items: { product_id: number; quantity: number }[],
  ): string {
    return items
      .map((i) => `${i.product_id}:${i.quantity}`)
      .sort()
      .join('|');
  }

  private async deductStockForOrder(
    order: any,
    branchId: number,
    token: string,
  ) {
    try {
      // Get ingredients for this branch
      const catalogUrl = process.env.CATALOG_SERVICE_URL;
      const ingredientsRes = await axios.get(
        `${catalogUrl}/ingredients/internal/by-branch?branch_id=${branchId}`,
      );
      const ingredients = ingredientsRes.data;

      const itemsToDeduct: { ingredient_id: number; quantity: number }[] = [];

      for (const orderItem of order.items) {
        if (orderItem.features && Array.isArray(orderItem.features)) {
          for (const feature of orderItem.features) {
            if (!feature.value) continue;
            // Handle multi-value features (comma-separated)
            const values = feature.value.split(',');
            for (const val of values) {
              const trimmed = val.trim();
              if (!trimmed) continue;
              const ingredient = ingredients.find(
                (ing: any) =>
                  ing.name_tag === feature.name_tag &&
                  ing.name.toLowerCase().includes(trimmed.toLowerCase()),
              );
              if (ingredient) {
                itemsToDeduct.push({
                  ingredient_id: ingredient.id,
                  quantity: orderItem.quantity,
                });
              }
            }
          }
        }
      }

      if (itemsToDeduct.length > 0) {
        console.log(
          `Descontando ${itemsToDeduct.length} ingredientes para orden ${order.id}`,
        );
        await axios.post(
          `${catalogUrl}/ingredients/internal/batch-deduct`,
          { items: itemsToDeduct },
        );
      }
    } catch (error) {
      console.error(`Error descontando stock para orden ${order.id}:`, error);
    }
  }

  private async restoreStockForOrder(
    order: any,
    branchId: number,
    token: string,
  ) {
    try {
      const catalogUrl = process.env.CATALOG_SERVICE_URL;
      const ingredientsRes = await axios.get(
        `${catalogUrl}/ingredients/internal/by-branch?branch_id=${branchId}`,
      );
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
                (ing: any) =>
                  ing.name_tag === feature.name_tag &&
                  ing.name.toLowerCase().includes(trimmed.toLowerCase()),
              );
              if (ingredient) {
                itemsToRestock.push({
                  ingredient_id: ingredient.id,
                  quantity: orderItem.quantity,
                });
              }
            }
          }
        }
      }

      if (itemsToRestock.length > 0) {
        console.log(
          `Restaurando ${itemsToRestock.length} ingredientes para orden ${order.id}`,
        );
        await axios.post(
          `${catalogUrl}/ingredients/internal/batch-restock`,
          { items: itemsToRestock },
        );
      }
    } catch (error) {
      console.error(`Error restaurando stock para orden ${order.id}:`, error);
    }
  }
}





