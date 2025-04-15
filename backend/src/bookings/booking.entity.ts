import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from '../users/user.entity';
  import { Service } from '../services/service.entity';
  import { BookingState } from './enums/booking-state.enum'; // lo creamos también
  
  @Entity('booking')
  export class Booking {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, { eager: false })
    @JoinColumn({ name: 'client_id' })
    client: User;
  
    @ManyToOne(() => Service, { eager: true }) // eager true porque lo usamos seguido
    @JoinColumn({ name: 'service_id' })
    service: Service;
  
    @Column({ name: 'booking_date', type: 'timestamp' })
    bookingDate: Date;
  
    @Column({ type: 'timestamp' })
    date: Date;
  
    @Column({ type: 'enum', enum: BookingState })
    state: BookingState;

    @Column({ name: 'url_images', nullable: true })
    urlImages: string;

    @Column({ type: 'double precision', nullable: true })
    price: number;

    @Column({ name: 'booked_hours', type: 'integer', nullable: true })
    bookedHours: number;

    
  }
  