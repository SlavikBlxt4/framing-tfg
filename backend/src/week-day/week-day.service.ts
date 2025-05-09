import { Injectable } from '@nestjs/common';

@Injectable()
export class WeekDayService {
  findAll() {
    return `This action returns all weekDay`;
  }

  findOne(id: number) {
    return `This action returns a #${id} weekDay`;
  }

  remove(id: number) {
    return `This action removes a #${id} weekDay`;
  }
}
