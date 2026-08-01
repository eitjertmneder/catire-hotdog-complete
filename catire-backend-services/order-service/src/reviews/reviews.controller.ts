import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDTO } from './dto/create-review.dto';
import { CheckPermission } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/permission.guard';
import { RemoteAuthGuard } from '../auth/remote-auth.guard';
import { type Request as TypedRequest } from '../types/request';

@UseGuards(RemoteAuthGuard, PermissionGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private service: ReviewsService) {}

  @Get()
  @CheckPermission('Reviews', 'read')
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  @CheckPermission('Reviews', 'create')
  async create(
    @Request() req: TypedRequest,
    @Body() body: CreateReviewDTO,
  ) {
    return this.service.create(body, req.user.id, req.user.full_name);
  }

  @Get('order/:orderId')
  @CheckPermission('Reviews', 'read')
  async findByOrder(@Param('orderId') orderId: string) {
    return this.service.findByOrder(orderId);
  }

  @Get('me')
  @CheckPermission('Reviews', 'read')
  async findMyReviews(@Request() req: TypedRequest) {
    return this.service.findByUser(req.user.id);
  }

  @Get('user/:userId')
  @CheckPermission('Reviews', 'read')
  async findByUser(@Param('userId') userId: number) {
    return this.service.findByUser(userId);
  }

  @Get(':id')
  @CheckPermission('Reviews', 'read')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @CheckPermission('Reviews', 'delete')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
