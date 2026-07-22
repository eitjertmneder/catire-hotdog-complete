import { PartialType } from '@nestjs/swagger';
import { CreateOrderDTO } from './create-order.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatusType } from '@prisma/client';

export class UpdateOrderDTO extends PartialType(CreateOrderDTO) {
  @IsOptional()
  @IsEnum(OrderStatusType, {
    message:
      'status: El estado de la orden debe ser uno de los siguientes valores: PENDING, PAID, PREPARING, READY, ON_THE_WAY, DELIVERED, CANCELLED.',
  })
  status?: OrderStatusType;

  @IsOptional()
  @IsString()
  cancel_reason?: string;
}
