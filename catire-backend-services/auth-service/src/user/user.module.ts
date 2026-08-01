import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UsersReportController } from './users-report.controller';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [AuthModule, SecurityModule],
  providers: [UserService],
  controllers: [UsersReportController, UsersController],
})
export class UserModule {}
