import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { RemoteAuthGuard } from '../auth/remote-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { CheckPermission } from '../auth/permission.decorator';

@Controller('audit')
export class AuditController {
  constructor(private service: AuditService) {}

  @Post()
  async create(@Body() body: {
    event_type: string;
    user_id?: number;
    user_name?: string;
    description: string;
    metadata?: any;
  }) {
    return this.service.log({
      type: body.event_type,
      action: body.event_type,
      description: body.description,
      user_email: body.user_name,
      user_id: body.user_id,
      metadata: body.metadata,
    });
  }

  @Get()
  @UseGuards(RemoteAuthGuard, PermissionGuard)
  @CheckPermission('Orders', 'read')
  async findAll(@Query('limit') limit?: string, @Query('type') type?: string) {
    return this.service.findAll(limit ? parseInt(limit) : 50, type);
  }

  @Get('stats')
  @UseGuards(RemoteAuthGuard, PermissionGuard)
  @CheckPermission('Orders', 'read')
  async getStats() {
    return this.service.getStats();
  }
}
