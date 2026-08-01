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
import { MenusService } from './menus.service';
import { CreateMenuDTO } from './dto/create-menu.dto';
import { UpdateMenuDTO } from './dto/update-menu.dto';

@UseGuards(RemoteAuthGuard, PermissionGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @CheckPermission('Menus', 'create')
  create(@Body() createMenuDto: CreateMenuDTO) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  @CheckPermission('Menus', 'read')
  findAll() {
    return this.menusService.findAll();
  }

  @Get(':id')
  @CheckPermission('Menus', 'read')
  async findOne(@Param('id') id: number) {
    const menu = await this.menusService.findOne(id);
    if (!menu) throw new NotFoundException(`Menu not found`);
    return menu;
  }

  @Patch(':id')
  @CheckPermission('Menus', 'update')
  async update(@Param('id') id: number, @Body() updateMenuDto: UpdateMenuDTO) {
    const menu = await this.menusService.update(id, updateMenuDto);
    if (!menu) throw new NotFoundException(`Menu not found`);
    return menu;
  }

  @Delete(':id')
  @CheckPermission('Menus', 'delete')
  async remove(@Param('id') id: number): Promise<void> {
    const menu = await this.menusService.remove(id);
    if (!menu) throw new NotFoundException(`Menu not found`);
  }
}
