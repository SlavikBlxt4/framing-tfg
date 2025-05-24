import { Type } from 'class-transformer';

export class CoordinateDto {
  @Type(() => Number)
  lat: number;

  @Type(() => Number)
  lon: number;
}

export class CreateLocationDto {
  @Type(() => Number)
  lat: number;

  @Type(() => Number)
  lon: number;
}
