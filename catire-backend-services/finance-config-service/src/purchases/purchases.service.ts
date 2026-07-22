import axios from 'axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Purchase } from '@prisma/client';
import { CreatePurchaseDTO } from './dto/create-purchase.dto';
import { UpdatePurchaseDTO } from './dto/update-purchase.dto';
import { User } from 'src/types/user';
import { Order } from 'src/types/order';
import { Product } from 'src/types/product';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async findAll(user?: User): Promise<Purchase[]> {
    if (user && user.role.name === 'client') {
      return await this.prisma.purchase.findMany({
        where: { user_id: user.id },
      });
    }
    return await this.prisma.purchase.findMany();
  }
  async findOne(id: string, user?: User): Promise<Purchase | null> {
    const purchase = await this.prisma.purchase.findUnique({ where: { id } });
    if (!purchase) return null;
    if (user && user.role.name === 'client' && purchase.user_id !== user.id)
      return null;
    return purchase;
  }

  async create(data: CreatePurchaseDTO, token: string): Promise<Purchase> {
    const order = await this.validateOrderById(data.order_id, token);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'PAID')
      throw new BadRequestException('La orden ya fue pagada.');

    const purchaseBase = await this.getPurchaseBase(order, token);

    const purchase = await this.prisma.purchase.create({
      data: {
        ...data,
        user_id: order.user_id,
        purchase_base: purchaseBase,
        purchase_total: purchaseBase + (data.purchase_additional || 0),
      },
    });

    await this.setOrderAsPaid(order.id, token);

    return purchase;
  }

  async update(id: string, data: UpdatePurchaseDTO): Promise<Purchase> {
    return await this.prisma.purchase.update({ where: { id }, data });
  }

  async remove(id: string): Promise<Purchase> {
    return await this.prisma.purchase.delete({ where: { id } });
  }

  async validateOrderById(
    order_id: string,
    token: string,
  ): Promise<Order | void> {
    try {
      const order = await axios.get(
        `${process.env.ORDER_SERVICE_URL}/orders/${order_id}`,
        { headers: { authorization: token } },
      );

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      return order.data as Order;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Order not found');
    }
  }

  async getPurchaseBase(order: Order, token: string): Promise<number> {
    try {
      const responses = await Promise.all(
        order.items.map((item) =>
          axios.get<Product>(
            `${process.env.CATALOG_SERVICE_URL}/products/${item.product_id}`,
            { headers: { authorization: token } },
          ),
        ),
      );

      const products = responses.map((res) => res.data);

      return products.reduce((total, product) => {
        const item = order.items.find((i) => i.product_id === product.id);
        if (!item) return total;

        return total + item.quantity * item.base_price;
      }, 0);
    } catch (error) {
      console.log(error);
      throw new NotFoundException(
        'Error al calcular el precio base de la compra',
      );
    }
  }

  async setOrderAsPaid(order_id: string, token: string): Promise<void> {
    try {
      await axios.patch(
        `${process.env.ORDER_SERVICE_URL}/orders/${order_id}`,
        {
          status: 'PAID',
        },
        { headers: { authorization: token } },
      );
    } catch (err) {
      console.log('Error actualizando la orden: ', err);
    }
  }
}
