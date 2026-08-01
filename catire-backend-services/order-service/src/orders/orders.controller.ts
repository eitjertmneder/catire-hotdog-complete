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
import { CheckPermission } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/permission.guard';
import { RemoteAuthGuard } from '../auth/remote-auth.guard';
import { type Request as TypedRequest } from '../types/request';

@UseGuards(RemoteAuthGuard, PermissionGuard)
@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Get()
  @CheckPermission('Orders', 'read')
  async findAll(@Request() req: TypedRequest) {
    return await this.service.findAll(req.headers?.authorization || '', req.user);
  }

  @Post()
  @CheckPermission('Orders', 'create')
  async create(
    @Request() req: TypedRequest,
    @Body() body: CreateOrderDTO,
  ) {
    return this.service.create(body, req.headers?.authorization || '', req.user.id);
  }

  @Get(':id')
  @CheckPermission('Orders', 'read')
  async findOne(@Param('id') id: string) {
    const order = await this.service.findOne(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  @Patch(':id')
  @CheckPermission('Orders', 'update')
  async update(
    @Request() req: TypedRequest,
    @Param('id') id: string,
    @Body() body: UpdateOrderDTO,
  ) {
    return this.service.update(id, body as any, req.headers?.authorization || '', req.user);
  }

  @Delete(':id')
  @CheckPermission('Orders', 'delete')
  async remove(@Param('id') id: string) {
    const order = await this.service.remove(id);
    if (!order) throw new NotFoundException('Order not found');
  }
}
