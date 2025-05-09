import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  ValidateNested,
  IsString,
  Matches,
} from 'class-validator';

export class TimeSlotDto {
  @ApiProperty({ example: '08:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  start: string;

  @ApiProperty({ example: '09:30' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  end: string;
}

export class CreatePhotographerAvailabilityDto {
  @ApiProperty({
    example: 2,
    description: 'Día de la semana (1=lunes ... 7=domingo)',
  })
  @IsInt()
  day: number;

  @ApiProperty({ type: [TimeSlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  slots: TimeSlotDto[];
}
