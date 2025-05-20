import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { Service } from 'src/services/service.entity';
import { Booking } from 'src/bookings/booking.entity';
import { S3Module } from 'src/s3/s3.module';
import { BookingsService } from 'src/bookings/bookings.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Notification } from 'src/notifications/notification.entity';
import { NotificationsGateway } from 'src/notifications/notification.gateway';
import { Category } from 'src/categories/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Service, Booking, Notification, Category]), // Asegúrate de importar la entidad Service si la necesitas
    AuthModule,
    S3Module,
  ],
  providers: [
    UsersService,
    BookingsService,
    NotificationsService,
    NotificationsGateway,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
