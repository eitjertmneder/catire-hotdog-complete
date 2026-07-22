import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { OrdersModule } from './orders/orders.module';
import { ImageStorageModule } from './image-storage/image-storage.module';
import { ImageController } from './image-storage/image.controller';

@Module({
  imports: [PrismaModule, OrdersModule, ImageStorageModule],
  controllers: [AppController, ImageController],
  providers: [AppService],
})
export class AppModule {}
