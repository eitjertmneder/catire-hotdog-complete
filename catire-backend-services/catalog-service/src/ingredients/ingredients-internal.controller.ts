import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { Ingredient } from '@prisma/client';

@Controller('ingredients/internal')
export class IngredientsInternalController {
  constructor(private service: IngredientsService) {}

  @Get('by-branch')
  async findByBranch(@Query('branch_id') branchId: string): Promise<Ingredient[]> {
    return this.service.findByBranch(parseInt(branchId, 10));
  }

  @Post('batch-deduct')
  async batchDeduct(@Body() body: { items: { ingredient_id: number; quantity: number }[] }) {
    const results: { id: number; success: boolean }[] = [];
    for (const item of body.items) {
      const result = await this.service.deductStock(item.ingredient_id, item.quantity);
      results.push({ id: item.ingredient_id, success: !!result });
    }
    return { results };
  }

  @Post('batch-restock')
  async batchRestock(@Body() body: { items: { ingredient_id: number; quantity: number }[] }) {
    const results: { id: number; success: boolean }[] = [];
    for (const item of body.items) {
      const result = await this.service.restock(item.ingredient_id, item.quantity);
      results.push({ id: item.ingredient_id, success: !!result });
    }
    return { results };
  }
}
