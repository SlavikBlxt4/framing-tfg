import { PartialType } from '@nestjs/swagger';
import { CreateWeekDayDto } from './create-week-day.dto';

export class UpdateWeekDayDto extends PartialType(CreateWeekDayDto) {}
