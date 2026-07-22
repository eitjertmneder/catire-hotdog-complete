import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Branch } from '@prisma/client';
import { CreateBranchDTO } from './dto/create-branch.dto';
import { UpdateBranchDTO } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDTO): Promise<Branch> {
    return await this.prisma.branch.create({
      data: createBranchDto,
    });
  }

  async getAll(): Promise<Branch[]> {
    return await this.prisma.branch.findMany();
  }

  async findOne(id: number): Promise<Branch | null> {
    return await this.prisma.branch.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateBranchDto: UpdateBranchDTO): Promise<Branch> {
    return await this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
    });
  }

  async remove(id: number): Promise<Branch | null> {
    return await this.prisma.branch.delete({
      where: { id },
    });
  }
}
