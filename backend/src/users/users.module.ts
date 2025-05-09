import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { Service } from 'src/services/service.entity';
import { Booking } from 'src/bookings/booking.entity';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Service, Booking]), // Asegúrate de importar la entidad Service si la necesitas
    AuthModule,
    S3Module,
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
