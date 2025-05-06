// src/locations/locations.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './location.entity';
import { Repository } from 'typeorm';
import { LocationResponseDto } from './dto/location-response.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
  ) {}
  async getAllLocations(): Promise<LocationResponseDto[]> {
    const locations = await this.locationRepo.find({
      relations: ['photographer'],
    });

    return locations.map((loc) => ({
      id: loc.id,
      photographerId: loc.photographer.id,
      coordinates: loc.coordinates,
    }));
  }
}
