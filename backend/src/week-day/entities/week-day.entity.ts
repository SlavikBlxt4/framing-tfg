import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PhotographerAvailability } from '../../photographer_availability/entities/photographer_availability.entity';

@Entity('week_days')
export class WeekDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  name: string;

  @OneToMany(() => PhotographerAvailability, (pa) => pa.day)
  availabilities: PhotographerAvailability[];
}
