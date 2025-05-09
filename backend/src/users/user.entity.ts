import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import {
  IsEmail,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Service } from 'src/services/service.entity';
import { Booking } from 'src/bookings/booking.entity';
import { Rating } from 'src/ratings/rating.entity';
import { Location } from 'src/locations/location.entity'; // ajusta la ruta según tu estructura
import { PhotographerAvailability } from 'src/photographer_availability/entities/photographer_availability.entity';


export enum UserRole {
  CLIENT = 'CLIENT',
  PHOTOGRAPHER = 'PHOTOGRAPHER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  password_hash: string;

  @Column({ nullable: true })
  @Matches(/^(\+?[0-9]{7,15})$/, {
    message: 'Invalid phone number',
  })
  @IsOptional()
  phone_number?: string;

  @CreateDateColumn({ type: 'timestamp' })
  registry_date: Date;

  @Column({ default: true })
  @IsBoolean()
  active: boolean;

  @Column({ type: 'varchar' })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  url_portfolio?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  url_profile_image?: string;

  @OneToMany(() => Booking, (booking) => booking.client)
  bookings: Booking[];

  @OneToMany(() => Service, (service) => service.photographer)
  services: Service[];

  @OneToMany(() => Rating, rating => rating.service)
  ratings: Rating[];

  @OneToMany(() => Location, (location) => location.photographer)
  locations: Location[];

  @OneToMany(() => PhotographerAvailability, (a) => a.photographer)
  availability: PhotographerAvailability[];


}
