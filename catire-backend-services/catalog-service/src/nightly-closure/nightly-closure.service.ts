import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NightlyClosureService {
  constructor(private prisma: PrismaService) {}

  async getTheoreticalStock(branchId: number, date: string) {
    const ingredients = await this.prisma.ingredient.findMany({
      where: { branch_id: branchId, deleted_at: null },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    const previousClosure = await this.prisma.$queryRaw`
      SELECT ingredient_id, physical as stock
      FROM nightly_closures
      WHERE branch_id = ${branchId}
        AND date = (SELECT MAX(date) FROM nightly_closures WHERE branch_id = ${branchId} AND date < ${date}::date)
    ` as any[];

    const previousMap = new Map(previousClosure.map((c: any) => [c.ingredient_id, c.stock]));

    return ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      category: ing.category,
      unit: ing.unit || 'unidades',
      opening_stock: previousMap.get(ing.id) || ing.stock,
      current_stock: ing.stock,
      theoretical: previousMap.get(ing.id) || ing.stock,
    }));
  }

  async saveClosure(branchId: number, date: string, closures: any[], closedBy: number) {
    const results: any[] = [];

    for (const closure of closures) {
      const difference = closure.theoretical - closure.physical;

      await this.prisma.$executeRaw`
        INSERT INTO nightly_closures (branch_id, ingredient_id, date, opening_stock, theoretical, physical, difference, closed_by, notes, created_at)
        VALUES (${branchId}, ${closure.ingredient_id}, ${date}::date, ${closure.opening_stock}, ${closure.theoretical}, ${closure.physical}, ${difference}, ${closedBy}, ${closure.notes || null}, NOW())
        ON CONFLICT (branch_id, ingredient_id, date)
        DO UPDATE SET
          physical = ${closure.physical},
          difference = ${difference},
          closed_by = ${closedBy},
          notes = ${closure.notes || null}
      `;

      await this.prisma.ingredient.update({
        where: { id: closure.ingredient_id },
        data: { stock: Math.round(closure.physical) },
      });

      results.push({
        ingredient_id: closure.ingredient_id,
        name: closure.name,
        theoretical: closure.theoretical,
        physical: closure.physical,
        difference,
      });
    }

    return results;
  }

  async getClosureHistory(branchId: number, limit: number = 30) {
    return this.prisma.$queryRaw`
      SELECT nc.date, nc.ingredient_id, i.name, i.category, nc.opening_stock, nc.theoretical, nc.physical, nc.difference, nc.notes
      FROM nightly_closures nc
      JOIN ingredients i ON i.id = nc.ingredient_id
      WHERE nc.branch_id = ${branchId}
      ORDER BY nc.date DESC, i.category ASC, i.name ASC
      LIMIT ${limit}
    `;
  }

  async getOpeningStock(branchId: number) {
    const result = await this.prisma.$queryRaw`
      SELECT nc.ingredient_id, i.name, i.category, nc.physical as opening_stock, nc.date
      FROM nightly_closures nc
      JOIN ingredients i ON i.id = nc.ingredient_id
      WHERE nc.branch_id = ${branchId}
        AND nc.date = (SELECT MAX(date) FROM nightly_closures WHERE branch_id = ${branchId})
      ORDER BY i.category ASC, i.name ASC
    ` as any[];

    return {
      date: result[0]?.date || null,
      ingredients: result,
    };
  }
}