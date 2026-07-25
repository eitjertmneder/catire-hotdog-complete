import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, SecurityModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
