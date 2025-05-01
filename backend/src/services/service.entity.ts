import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Booking } from 'src/bookings/booking.entity';
import { Rating } from 'src/ratings/rating.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('service')
export class Service {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @Column()
  @ApiProperty({ example: 'Sesión de retrato' })
  name: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ example: 'Fotos profesionales en estudio con fondo blanco' })
  description: string;

  @Column({ type: 'float' })
  @ApiProperty({ example: 150.0 })
  price: number;

  @Column({ name: 'image_url', nullable: true })
  @ApiPropertyOptional({ example: 'https://example.com/foto.jpg' })
  imageUrl: string;


  @Column({ type: 'int', name: 'minimum_minutes', nullable: false })
  @ApiProperty({ example: 2, description: 'Horas mínimas contratables' })
  minimum_minutes: number;

  @Column({ type: 'numeric', name: 'discount', precision: 5, scale: 2, nullable: true })
  @ApiPropertyOptional({ example: 10.0, description: 'Descuento aplicado (%)' })
  discount?: number;

  @ManyToOne(() => User, (user) => user.services, { eager: false })
  @JoinColumn({ name: 'photographer_id' })
  @ApiProperty({ type: () => User })
  photographer: User;

  @OneToMany(() => Rating, (rating) => rating.service)
  ratings: Rating[];

  @OneToMany(() => Booking, (booking) => booking.service)
  bookings: Booking[];

  @ManyToOne(() => Category, (category) => category.services, { eager: true })
  @JoinColumn({ name: 'category_id' })
  @ApiProperty({ type: () => Category })
  category: Category;
}
