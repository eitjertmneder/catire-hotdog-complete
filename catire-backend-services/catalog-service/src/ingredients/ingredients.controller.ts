import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Delete,
  UseGuards,
  NotFoundException,
  Patch,
  Query,
} from '@nestjs/common';
import { CheckPermission } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/permission.guard';
import { RemoteAuthGuard } from '../auth/remote-auth.guard';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDTO } from './dto/create-ingredient.dto';
import { UpdateIngredientDTO } from './dto/update-ingredient.dto';
import { Ingredient } from '@prisma/client';

@UseGuards(RemoteAuthGuard, PermissionGuard)
@Controller('ingredients')
export class IngredientsController {
  constructor(private service: IngredientsService) {}

  @Get()
  @CheckPermission('Products', 'read')
  async findAll(
    @Query('category') category?: string,
    @Query('branch_id') branchId?: string,
  ): Promise<Ingredient[]> {
    if (category) {
      return this.service.findByCategory(category);
    }
    if (branchId) {
      return this.service.findByBranch(parseInt(branchId, 10));
    }
    return this.service.findAll();
  }

  @Get('available')
  async findAvailable(
    @Query('branch_id') branchId: string,
  ) {
    return this.service.findAvailable(parseInt(branchId, 10));
  }

  @Get('branch/:branchId')
  @CheckPermission('Products', 'read')
  async findByBranch(@Param('branchId') branchId: number): Promise<Ingredient[]> {
    return this.service.findByBranch(branchId);
  }

  @Get(':id')
  @CheckPermission('Products', 'read')
  async findOne(@Param('id') id: number): Promise<Ingredient> {
    const ingredient = await this.service.findOne(id);
    if (!ingredient) throw new NotFoundException('Ingredient not found');
    return ingredient;
  }

  @Post()
  @CheckPermission('Products', 'create')
  async create(@Body() body: CreateIngredientDTO): Promise<Ingredient> {
    return this.service.create(body);
  }

  @Patch(':id')
  @CheckPermission('Products', 'update')
  async update(
    @Param('id') id: number,
    @Body() body: UpdateIngredientDTO,
  ): Promise<Ingredient> {
    const ingredient = await this.service.update(id, body);
    if (!ingredient) throw new NotFoundException('Ingredient not found');
    return ingredient;
  }

  @Patch(':id/restock')
  @CheckPermission('Products', 'update')
  async restock(
    @Param('id') id: number,
    @Body('quantity') quantity: number,
  ): Promise<Ingredient> {
    const ingredient = await this.service.restock(id, quantity);
    if (!ingredient) throw new NotFoundException('Ingredient not found');
    return ingredient;
  }

  @Patch(':id/deduct')
  @CheckPermission('Products', 'update')
  async deduct(
    @Param('id') id: number,
    @Body('quantity') quantity: number,
  ): Promise<Ingredient> {
    const ingredient = await this.service.deductStock(id, quantity);
    if (!ingredient) throw new NotFoundException('Insufficient stock or ingredient not found');
    return ingredient;
  }

  @Delete(':id')
  @CheckPermission('Products', 'delete')
  async remove(@Param('id') id: number): Promise<void> {
    const deleted = await this.service.remove(id);
    if (!deleted) throw new NotFoundException('Ingredient not found');
  }
}
