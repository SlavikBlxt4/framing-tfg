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
import { S3Module } from 'src/s3/s3.module';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationsGateway } from 'src/notifications/notification.gateway';
import { Notification } from 'src/notifications/notification.entity';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      User,
      Service,
      Category,
      WeekDay,
      Notification,
    ]),
    S3Module,
  ],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    ServicesService,
    CategoriesService,
    NotificationsService,
    NotificationsGateway,
    S3Service,
  ],
})
export class BookingsModule {}
