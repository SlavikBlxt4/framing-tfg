import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Schedule } from '../../schedule/entities/schedule.entity'; 

@Entity('photographer_availability')
export class PhotographerAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'photographer_id' })
  photographerId: number;

  @Column({ name: 'day_id' })
  dayId: number;

  @Column({ name: 'schedule_id' })
  scheduleId: number;

  @ManyToOne(() => Schedule)
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;
}
