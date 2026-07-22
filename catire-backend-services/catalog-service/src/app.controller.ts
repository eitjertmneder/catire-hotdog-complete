import { Controller, Get, UseGuards } from '@nestjs/common';
import { RemoteAuthGuard } from './auth/remote-auth.guard';
import { PermissionGuard } from './auth/permission.guard';
import { AppService } from './app.service';

@UseGuards(RemoteAuthGuard, PermissionGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
