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
import { ProductsService } from './products.service';
import { CreateProductDTO } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { Product } from '@prisma/client';

@UseGuards(RemoteAuthGuard, PermissionGuard)
@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Get()
  @CheckPermission('Products', 'read')
  async findAll(@Query('menuId') menuId?: string): Promise<Product[]> {
    return this.service.findAll(menuId ? Number(menuId) : undefined);
  }

  @Get(':id')
  @CheckPermission('Products', 'read')
  async findOne(@Param('id') id: number): Promise<Product | null> {
    const product = await this.service.findOne(id);
    if (!product) throw new NotFoundException(`Product not found`);
    return product;
  }

  @Post()
  @CheckPermission('Products', 'create')
  async create(@Body() body: CreateProductDTO): Promise<Product> {
    return this.service.create(body);
  }

  @Patch(':id')
  @CheckPermission('Products', 'update')
  async update(
    @Param('id') id: number,
    @Body() body: UpdateProductDTO,
  ): Promise<Product> {
    const product = await this.service.update(id, body);
    if (!product) throw new NotFoundException(`Product not found`);
    return product;
  }

  @Delete(':id')
  @CheckPermission('Products', 'delete')
  async remove(@Param('id') id: number): Promise<void> {
    const product = await this.service.remove(id);
    if (!product) throw new NotFoundException(`Product not found`);
  }
}