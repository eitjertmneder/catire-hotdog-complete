import { Module } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { IngredientsInternalController } from './ingredients-internal.controller';

@Module({
  providers: [IngredientsService],
  controllers: [IngredientsController, IngredientsInternalController],
  exports: [IngredientsService],
})
export class IngredientsModule {}
