import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { Service } from 'src/services/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Service]),  // Asegúrate de importar la entidad Service si la necesitas
  AuthModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
