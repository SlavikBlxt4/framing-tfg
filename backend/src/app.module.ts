import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module'; // 👈 IMPORTA TU MODULO AQUÍ
import { ServicesModule } from './services/services.module';
import { CategoriesModule } from './categories/categories.module';
import { BookingsModule } from './bookings/bookings.module';
import { RatingsModule } from './ratings/ratings.module';
import { LocationsModule } from './locations/locations.module';
import { PhotographerAvailabilityModule } from './photographer_availability/photographer_availability.module';
import { ScheduleModule } from './schedule/schedule.module';
import { WeekDayModule } from './week-day/week-day.module';
import { S3Service } from './s3/s3.service';
import { S3Module } from './s3/s3.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    DatabaseModule, // 👈 NECESARIO para TypeORM global
    UsersModule,
    AuthModule,
    ServicesModule,
    CategoriesModule,
    BookingsModule,
    RatingsModule,
    LocationsModule,
    S3Module,
    PhotographerAvailabilityModule,
    ScheduleModule,
    WeekDayModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
export class AppModule {}
