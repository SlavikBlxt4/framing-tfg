import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotographerAvailability } from './entities/photographer_availability.entity';
import { PhotographerAvailabilityService } from './photographer_availability.service';
import { PhotographerAvailabilityController } from './photographer_availability.controller';
import { Schedule } from '../schedule/entities/schedule.entity'; 
import { ScheduleModule } from '../schedule/schedule.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([PhotographerAvailability, Schedule]),
    ScheduleModule, // opcional si necesitas servicios compartidos
  ],
  controllers: [PhotographerAvailabilityController],
  providers: [PhotographerAvailabilityService],
})
export class PhotographerAvailabilityModule {}
