import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { User } from '../users/user.entity';
import { Service } from '../services/service.entity';
import { ServicesService } from 'src/services/services.service';
import { CategoriesService } from 'src/categories/categories.service';
import { Category } from 'src/categories/category.entity';
import { WeekDay } from 'src/week-day/entities/week-day.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, User, Service, Category, WeekDay, ]), // 👈 Esto es CLAVE
  ],
  controllers: [BookingsController],
  providers: [BookingsService, ServicesService, CategoriesService],
})
export class BookingsModule {}
