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
import { OrdersService } from './orders.service';
import { CreateOrderDTO } from './dto/create-order.dto';
import { UpdateOrderDTO } from './dto/update-order.dto';
import { Prisma } from '@prisma/client';
import { CheckPermission } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/permission.guard';
import { RemoteAuthGuard } from '../auth/remote-auth.guard';
import { type Request as TypedRequest } from '../types/request';

@UseGuards(RemoteAuthGuard, PermissionGuard)
@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Get()
  @UseGuards(PermissionGuard)
  @CheckPermission('Orders', 'read')
  async findAll(@Request() req: TypedRequest) {
    return await this.service.findAll(
      req.headers?.authorization || '',
      req.user,
    );
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Orders', 'create')
  @Post()
  async create(
    @Request() req: TypedRequest,
    @Body() body: CreateOrderDTO,
  ): Promise<Prisma.OrderGetPayload<{ include: { items: true } }>> {
    return this.service.create(
      body,
      req.headers?.authorization || '',
      req.user.id,
    );
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Orders', 'update')
  @Patch(':id')
  async update(
    @Request() req: TypedRequest,
    @Param('id') id: string,
    @Body() body: UpdateOrderDTO,
  ): Promise<Prisma.OrderGetPayload<{ include: { items: true } }>> {
    const order = await this.service.findOne(
      id,
      req.headers?.authorization || '',
      req.user,
    );
    if (!order) throw new NotFoundException('Order not found');
    return this.service.update(id, body, req.headers?.authorization || '', req.user);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Orders', 'delete')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const order = await this.service.remove(id);
    if (!order) throw new NotFoundException('Order not found');
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Orders', 'read')
  @Get(':id')
  async findOne(
    @Request() req: TypedRequest,
    @Param('id') id: string,
  ): Promise<Prisma.OrderGetPayload<{ include: { items: true } }> | null> {
    const order = await this.service.findOne(
      id,
      req.headers?.authorization || '',
      req.user,
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
