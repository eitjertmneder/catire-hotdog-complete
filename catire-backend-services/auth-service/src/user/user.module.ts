import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UsersReportController } from './users-report.controller';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [UserService],
  controllers: [UsersReportController, UsersController],
})
export class UserModule {}
