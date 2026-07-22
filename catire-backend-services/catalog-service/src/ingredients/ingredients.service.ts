import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Ingredient, Prisma } from '@prisma/client';
import { CreateIngredientDTO } from './dto/create-ingredient.dto';
import { UpdateIngredientDTO } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId?: number): Promise<Ingredient[]> {
    const where: any = { deleted_at: null };
    if (branchId !== undefined && branchId !== null) {
      where.branch_id = branchId;
    }
    return this.prisma.ingredient.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: number): Promise<Ingredient | null> {
    return this.prisma.ingredient.findFirst({
      where: { id, deleted_at: null },
    });
  }

  async findByCategory(category: string): Promise<Ingredient[]> {
    return this.prisma.ingredient.findMany({
      where: { category, deleted_at: null },
    });
  }

  async findByBranch(branchId: number): Promise<Ingredient[]> {
    return this.prisma.ingredient.findMany({
      where: { branch_id: branchId, deleted_at: null },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findAvailable(branchId: number) {
    // Obtener ingredientes del catálogo maestro (branch_id IS NULL) que están disponibles en esta sucursal
    const result = await this.prisma.$queryRaw`
      SELECT i.id, i.name, i.category, i.unit, i.stock, i.extra_price, i.name_tag, i.feature_value,
             COALESCE(ia.available, true) as available
      FROM ingredients i
      LEFT JOIN ingredient_availability ia ON ia.ingredient_id = i.id AND ia.branch_id = ${branchId}
      WHERE i.branch_id IS NULL 
        AND i.deleted_at IS NULL
        AND COALESCE(ia.available, true) = true
        AND i.stock > 0
      ORDER BY i.category ASC, i.name ASC
    ` as any[];

    // Agrupar por categoría
    const grouped: Record<string, any[]> = {};
    for (const item of result) {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    }

    return grouped;
  }

  async create(data: CreateIngredientDTO): Promise<Ingredient> {
    return this.prisma.ingredient.create({
      data: data as unknown as Prisma.IngredientCreateInput,
    });
  }

  async update(id: number, data: UpdateIngredientDTO): Promise<Ingredient | null> {
    try {
      return await this.prisma.ingredient.update({
        where: { id },
        data,
      });
    } catch {
      return null;
    }
  }

  async restock(id: number, quantity: number): Promise<Ingredient | null> {
    try {
      const ingredient = await this.findOne(id);
      if (!ingredient) return null;

      return await this.prisma.ingredient.update({
        where: { id },
        data: { stock: ingredient.stock + quantity },
      });
    } catch {
      return null;
    }
  }

  async deductStock(id: number, quantity: number): Promise<Ingredient | null> {
    try {
      const ingredient = await this.findOne(id);
      if (!ingredient) return null;
      if (ingredient.stock < quantity) return null;

      return await this.prisma.ingredient.update({
        where: { id },
        data: { stock: ingredient.stock - quantity },
      });
    } catch {
      return null;
    }
  }

  async remove(id: number): Promise<boolean> {
    try {
      await this.prisma.ingredient.update({
        where: { id },
        data: { deleted_at: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }
}
