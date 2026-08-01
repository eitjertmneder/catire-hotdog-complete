import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CheckPermission } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/permission.guard';
import { RemoteAuthGuard } from '../auth/remote-auth.guard';
import { BranchesService } from './branches.service';
import { Branch } from '@prisma/client';
import { CreateBranchDTO } from './dto/create-branch.dto';
import { UpdateBranchDTO } from './dto/update-branch.dto';

@UseGuards(RemoteAuthGuard, PermissionGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @CheckPermission('Branches', 'create')
  async create(@Body() createBranchDto: CreateBranchDTO): Promise<Branch> {
    return await this.branchesService.create(createBranchDto);
  }

  @Get()
  @CheckPermission('Branches', 'read')
  async findAll(): Promise<Branch[]> {
    return await this.branchesService.getAll();
  }

  @Get(':id')
  @CheckPermission('Branches', 'read')
  async findOne(@Param('id') id: number): Promise<Branch | null> {
    const branch = await this.branchesService.findOne(id);
    if (!branch) throw new NotFoundException(`Branch not found`);

    return branch;
  }

  @Patch(':id')
  @CheckPermission('Branches', 'update')
  async update(
    @Param('id') id: number,
    @Body() updateBranchDto: UpdateBranchDTO,
  ): Promise<Branch> {
    const branch = await this.branchesService.update(id, updateBranchDto);
    if (!branch) throw new NotFoundException(`Branch not found`);
    return branch;
  }

  @Delete(':id')
  @CheckPermission('Branches', 'delete')
  async remove(@Param('id') id: number): Promise<void> {
    const branch = await this.branchesService.remove(id);
    if (!branch) throw new NotFoundException(`Branch not found`);
  }
}
