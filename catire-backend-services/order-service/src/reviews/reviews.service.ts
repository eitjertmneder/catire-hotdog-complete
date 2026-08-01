import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDTO } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.review.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });
    if (!review || review.deleted_at)
      throw new NotFoundException('Reseña no encontrada');
    return review;
  }

  async findByOrder(orderId: string) {
    return this.prisma.review.findMany({
      where: { order_id: orderId, deleted_at: null },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.review.findMany({
      where: { user_id: userId, deleted_at: null },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(data: CreateReviewDTO, userId: number, userName: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: data.order_id },
    });
    if (!order || order.deleted_at)
      throw new NotFoundException('Orden no encontrada');

    const existingReview = await this.prisma.review.findFirst({
      where: {
        order_id: data.order_id,
        user_id: userId,
        deleted_at: null,
      },
    });
    if (existingReview)
      throw new ConflictException('Ya existe una reseña para esta orden');

    return this.prisma.review.create({
      data: {
        order_id: data.order_id,
        user_id: userId,
        user_name: userName,
        rating: data.rating,
        comment: data.comment,
      },
    });
  }

  async remove(id: string) {
    const review = await this.findOne(id);
    return this.prisma.review.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
