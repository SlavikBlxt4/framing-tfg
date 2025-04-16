import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Service } from '../services/service.entity';
import { Min, Max, IsInt, IsOptional, IsString } from 'class-validator';

@Entity('rating')
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Service, (service) => service.ratings)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
