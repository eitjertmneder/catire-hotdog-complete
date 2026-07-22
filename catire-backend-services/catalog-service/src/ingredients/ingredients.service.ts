import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Ingredient } from '@prisma/client';
import { CreateIngredientDTO } from './dto/create-ingredient.dto';
import { UpdateIngredientDTO } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Ingredient[]> {
    return await this.prisma.ingredient.findMany({
      where: { deleted_at: null },
      orderBy: { name: 'asc' },
    });
  }

  async findByBranch(branchId: number): Promise<Ingredient[]> {
    return await this.prisma.ingredient.findMany({
      where: { branch_id: branchId, deleted_at: null },
      orderBy: { name: 'asc' },
    });
  }

  async findByCategory(category: string): Promise<Ingredient[]> {
    return await this.prisma.ingredient.findMany({
      where: { category, deleted_at: null },
      orderBy: { name: 'asc' },
    });
  }

  async findAvailable(branchId: number): Promise<Ingredient[]> {
    return await this.prisma.ingredient.findMany({
      where: { branch_id: branchId, deleted_at: null, stock: { gt: 0 } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number): Promise<Ingredient | null> {
    return await this.prisma.ingredient.findUnique({ where: { id } });
  }

  async create(data: CreateIngredientDTO): Promise<Ingredient> {
    return await this.prisma.ingredient.create({ data });
  }

  async update(id: number, data: UpdateIngredientDTO): Promise<Ingredient> {
    return await this.prisma.ingredient.update({ where: { id }, data });
  }

  async restock(id: number, quantity: number): Promise<Ingredient | null> {
    try {
      const ingredient = await this.findOne(id);
      if (!ingredient) return null;

      // Use atomic increment to prevent race conditions
      return await this.prisma.ingredient.update({
        where: { id },
        data: { stock: { increment: quantity } },
      });
    } catch {
      return null;
    }
  }

  async deductStock(id: number, quantity: number): Promise<Ingredient | null> {
    try {
      const ingredient = await this.findOne(id);
      if (!ingredient) return null;
      if (ingredient.stock < quantity) {
        console.warn('Stock insuficiente para ingrediente:', id, 'actual:', ingredient.stock, 'solicitado:', quantity);
        return null;
      }

      // Use atomic decrement
      const updated = await this.prisma.ingredient.update({
        where: { id },
        data: { stock: { decrement: quantity } },
      });

      return updated;
    } catch (error) {
      console.error('Error en deductStock para ingrediente:', id, error);
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

