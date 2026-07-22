import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { RemoteAuthGuard } from './auth/remote-auth.guard';
import { PermissionGuard } from './auth/permission.guard';

@Controller()
@UseGuards(RemoteAuthGuard, PermissionGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
