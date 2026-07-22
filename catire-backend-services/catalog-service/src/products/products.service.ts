import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';
import { CreateProductDTO } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(menuId?: number) {
    const where: Prisma.ProductWhereInput = {};
    if (menuId) {
      where.menu_id = menuId;
    }
    return this.prisma.product.findMany({
      where,
      include: { category: true },
    });
  }

  async findOne(id: number): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async create(data: CreateProductDTO): Promise<Product> {
    return this.prisma.product.create({
      data: data as unknown as Prisma.ProductCreateInput,
    });
  }

  async update(id: number, data: UpdateProductDTO): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number): Promise<boolean> {
    try {
      await this.prisma.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}