import { PartialType } from '@nestjs/swagger';
import { CreatePhotographerAvailabilityDto } from './create-photographer_availability.dto';

export class UpdatePhotographerAvailabilityDto extends PartialType(
  CreatePhotographerAvailabilityDto,
) {}
