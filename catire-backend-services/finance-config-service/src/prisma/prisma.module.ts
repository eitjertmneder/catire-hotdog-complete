import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IsRelationship } from './validator/IsRelationship.validator';
import { IsUnique } from './validator/IsUnique.validator';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: IsRelationship,
      useClass: IsRelationship,
    },
    {
      provide: IsUnique,
      useClass: IsUnique,
    },
  ],
  exports: [
    PrismaService,
    IsRelationship,
    IsUnique,
  ],
})
export class PrismaModule {}
