import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IsRelationship } from './validator/IsRelationship.validator';
import { IsUnique } from './validator/IsUnique.validator';
import { IsMultipleRelationship } from './validator/IsMultipleRelationship.validator';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: IsRelationship,
      useClass: IsRelationship,
    },
    {
      provide: IsMultipleRelationship,
      useClass: IsMultipleRelationship,
    },
    {
      provide: IsUnique,
      useClass: IsUnique,
    },
  ],
  exports: [PrismaService, IsRelationship, IsMultipleRelationship, IsUnique],
})
export class PrismaModule {}
