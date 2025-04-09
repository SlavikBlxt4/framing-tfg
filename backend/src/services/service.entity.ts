import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
  } from 'typeorm';
  import { User } from '../users/user.entity';
//   import { Rating } from '../ratings/rating.entity';
//   import { Booking } from '../bookings/booking.entity';
  import { Category } from '../categories/category.entity';
  
  @Entity('service')
  export class Service {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column({ nullable: true })
    description: string;
  
    @Column({ type: 'float' })
    price: number;
  
    @Column({ name: 'image_url', nullable: true })
    imageUrl: string;
  
    @ManyToOne(() => User, (user) => user.services, { eager: false })
    @JoinColumn({ name: 'photographer_id' })
    photographer: User;
  
    // @OneToMany(() => Rating, (rating) => rating.service)
    // ratings: Rating[];
  
    // @OneToMany(() => Booking, (booking) => booking.service)
    // bookings: Booking[];
  
    @ManyToOne(() => Category, (category) => category.services, { eager: true })
    @JoinColumn({ name: 'category_id' })
    category: Category;
  
    @Column({ nullable: true, type: 'text' })
    availability: string; // Puede almacenar JSON como string
  }
  