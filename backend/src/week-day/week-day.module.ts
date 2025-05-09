import { Module } from '@nestjs/common';
import { WeekDayService } from './week-day.service';
import { WeekDayController } from './week-day.controller';

@Module({
  controllers: [WeekDayController],
  providers: [WeekDayService],
})
export class WeekDayModule {}
