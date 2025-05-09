import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Schedule } from '../../schedule/entities/schedule.entity';
import { User } from '../../users/user.entity';
import { WeekDay } from '../../week-day/entities/week-day.entity';
 

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

  @ManyToOne(() => User, (user) => user.availability, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'photographer_id' })
  photographer: User;

  @ManyToOne(() => WeekDay, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'day_id' })
  day: WeekDay;


}
