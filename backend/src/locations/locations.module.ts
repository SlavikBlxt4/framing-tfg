// src/locations/locations.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './location.entity';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  providers: [LocationsService],
  controllers: [LocationsController],
})
export class LocationsModule {}
