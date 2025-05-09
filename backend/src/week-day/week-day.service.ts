import { Injectable } from '@nestjs/common';
import { CreateWeekDayDto } from './dto/create-week-day.dto';
import { UpdateWeekDayDto } from './dto/update-week-day.dto';

@Injectable()
export class WeekDayService {
  create(createWeekDayDto: CreateWeekDayDto) {
    return 'This action adds a new weekDay';
  }

  findAll() {
    return `This action returns all weekDay`;
  }

  findOne(id: number) {
    return `This action returns a #${id} weekDay`;
  }

  update(id: number, updateWeekDayDto: UpdateWeekDayDto) {
    return `This action updates a #${id} weekDay`;
  }

  remove(id: number) {
    return `This action removes a #${id} weekDay`;
  }
}
