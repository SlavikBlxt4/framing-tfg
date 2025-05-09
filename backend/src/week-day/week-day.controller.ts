import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WeekDayService } from './week-day.service';


@Controller('week-day')
export class WeekDayController {
  constructor(private readonly weekDayService: WeekDayService) {}

  @Get()
  findAll() {
    return this.weekDayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weekDayService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weekDayService.remove(+id);
  }
}
