import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { NightlyClosureService } from './nightly-closure.service';
import { RemoteAuthGuard } from '../auth/remote-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { CheckPermission } from '../auth/permission.decorator';

@Controller('nightly-closure')
@UseGuards(RemoteAuthGuard, PermissionGuard)
export class NightlyClosureController {
  constructor(private service: NightlyClosureService) {}

  @Get('theoretical')
  @CheckPermission('Ingredients', 'read')
  async getTheoreticalStock(
    @Query('branch_id') branchId: string,
    @Query('date') date: string,
  ) {
    return this.service.getTheoreticalStock(parseInt(branchId), date);
  }

  @Post('save')
  @CheckPermission('Ingredients', 'update')
  async saveClosure(
    @Body() body: { branch_id: number; date: string; closures: any[]; closed_by: number },
  ) {
    return this.service.saveClosure(body.branch_id, body.date, body.closures, body.closed_by);
  }

  @Get('history')
  @CheckPermission('Ingredients', 'read')
  async getClosureHistory(
    @Query('branch_id') branchId: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getClosureHistory(parseInt(branchId), limit ? parseInt(limit) : 30);
  }

  @Get('opening')
  @CheckPermission('Ingredients', 'read')
  async getOpeningStock(@Query('branch_id') branchId: string) {
    return this.service.getOpeningStock(parseInt(branchId));
  }
}
