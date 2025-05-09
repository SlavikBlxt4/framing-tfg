import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WeekDayService } from './week-day.service';
import { CreateWeekDayDto } from './dto/create-week-day.dto';
import { UpdateWeekDayDto } from './dto/update-week-day.dto';

@Controller('week-day')
export class WeekDayController {
  constructor(private readonly weekDayService: WeekDayService) {}

  @Post()
  create(@Body() createWeekDayDto: CreateWeekDayDto) {
    return this.weekDayService.create(createWeekDayDto);
  }

  @Get()
  findAll() {
    return this.weekDayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weekDayService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWeekDayDto: UpdateWeekDayDto) {
    return this.weekDayService.update(+id, updateWeekDayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weekDayService.remove(+id);
  }
}
