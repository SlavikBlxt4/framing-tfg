import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  serviceId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  ratingValue: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
