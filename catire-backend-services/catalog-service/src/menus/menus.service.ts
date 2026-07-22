import { Injectable } from '@nestjs/common';
import { Menu } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuDTO } from './dto/create-menu.dto';
import { UpdateMenuDTO } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuDto: CreateMenuDTO): Promise<Menu> {
    return await this.prisma.menu.create({
      data: createMenuDto,
    });
  }

  async findAll(): Promise<Menu[]> {
    return await this.prisma.menu.findMany({
      include: { products: { include: { category: true } } },
    });
  }

  async findOne(id: number): Promise<Menu | null> {
    return await this.prisma.menu.findUnique({
      where: { id },
      include: { products: { include: { category: true } } },
    });
  }

  async update(id: number, updateMenuDto: UpdateMenuDTO): Promise<Menu> {
    return await this.prisma.menu.update({
      where: { id },
      data: updateMenuDto,
    });
  }

  async remove(id: number): Promise<Menu> {
    return await this.prisma.menu.delete({
      where: { id },
    });
  }
}
