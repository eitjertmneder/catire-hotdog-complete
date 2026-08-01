import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDTO } from './dto/create-purchase.dto';
import { UpdatePurchaseDTO } from './dto/update-purchase.dto';
import { Purchase } from '@prisma/client';
import { CheckPermission } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/permission.guard';
import { RemoteAuthGuard } from '../auth/remote-auth.guard';
import { type Request as TypedRequest } from '../types/request';

@UseGuards(RemoteAuthGuard, PermissionGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private service: PurchasesService) {}

  @Get()
  @CheckPermission('Purchases', 'read')
  async findAll(): Promise<Purchase[]> {
    return await this.service.findAll();
  }

  @Get(':id')
  @CheckPermission('Purchases', 'read')
  async findOne(
    @Request() req: TypedRequest,
    @Param('id') id: string,
  ): Promise<Purchase | null> {
    const purchase = await this.service.findOne(id);
    if (!purchase) throw new NotFoundException('Purchase not found');
    return purchase;
  }

  @Post()
  @CheckPermission('Purchases', 'create')
  async create(
    @Body() body: CreatePurchaseDTO,
    @Request() req: TypedRequest,
  ): Promise<Purchase> {
    return await this.service.create(body, req.headers.authorization || '');
  }

  @Patch(':id')
  @CheckPermission('Purchases', 'update')
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePurchaseDTO,
  ): Promise<Purchase> {
    const purchase = await this.service.update(id, body);
    if (!purchase) throw new NotFoundException('Purchase not found');
    return purchase;
  }

  @Delete(':id')
  @CheckPermission('Purchases', 'delete')
  async remove(@Param('id') id: string): Promise<void> {
    const purchase = await this.service.remove(id);
    if (!purchase) throw new NotFoundException('Purchase not found');
  }
}
