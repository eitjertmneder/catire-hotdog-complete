import { Module } from '@nestjs/common';
import { NightlyClosureService } from './nightly-closure.service';
import { NightlyClosureController } from './nightly-closure.controller';

@Module({
  providers: [NightlyClosureService],
  controllers: [NightlyClosureController],
  exports: [NightlyClosureService],
})
export class NightlyClosureModule {}
