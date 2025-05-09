import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('schedule')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'time without time zone' })
  starting_hour: string;

  @Column({ type: 'time without time zone' })
  ending_hour: string;
}
