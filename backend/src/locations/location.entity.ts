// src/locations/location.entity.ts
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from '../users/user.entity';
  import { ApiProperty } from '@nestjs/swagger';
  
  @Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'photographer_id' })
  @ApiProperty({ type: () => User, description: 'Fotógrafo asociado' })
  photographer: User;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @ApiProperty({
    example: { type: 'Point', coordinates: [-3.7058, 40.4203] },
    description: 'Coordenadas geográficas en formato GeoJSON',
  })
  coordinates: object;
}
  