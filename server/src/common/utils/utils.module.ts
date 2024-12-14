import { Module } from '@nestjs/common';
import { UniqueCodeService } from './unique-code/unique-code.service';
import { DateUtilsService } from './date-time/date-time.service';
import { HashingService } from './hashing/hashing.service';

@Module({
  controllers: [],
  providers: [UniqueCodeService, DateUtilsService, HashingService],
  exports: [UniqueCodeService, DateUtilsService, HashingService],
})
export class UtilsModule {}
