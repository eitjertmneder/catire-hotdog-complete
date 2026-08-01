import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { CheckPermission } from '../auth/permission.decorator';

@Controller('users')
export class UsersController {
  constructor(private service: UserService) {}

  // Internal endpoint for service-to-service communication (no auth required)
  @Get('internal/:id')
  async findUserInternal(@Param('id') id: number) {
    const user = await this.service.getUserById(id);
    if (!user) return null;
    // Return only safe fields
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id,
      branch_id: user.branch_id,
    };
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get()
  @CheckPermission('Users', 'read')
  async findAll(): Promise<User[]> {
    return this.service.findAllUsers();
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get(':id')
  @CheckPermission('Users', 'read')
  async findOne(@Param('id') id: number): Promise<User | null> {
    const user = await this.service.getUserById(id);
    if (!user) throw new NotFoundException(`User not found`);
    return user;
  }

  @Post()
  @CheckPermission('Users', 'create')
  async create(@Body() body: CreateUserDto): Promise<User | null> {
    return this.service.createUser(body);
  }

  @Put(':id')
  @CheckPermission('Users', 'update')
  async update(
    @Param('id') id: number,
    @Body() body: UpdateUserDTO,
  ): Promise<User | null> {
    const user = await this.service.updateUser(id, body);
    if (!user) throw new NotFoundException(`User not found`);
    return user;
  }

  @Delete(':id')
  @CheckPermission('Users', 'delete')
  async remove(@Param('id') id: number): Promise<void> {
    const user = await this.service.deleteUser(id);
    if (!user) throw new NotFoundException(`User not found`);
  }
}
