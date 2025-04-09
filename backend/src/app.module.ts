import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module'; // 👈 IMPORTA TU MODULO AQUÍ
import { ServicesModule } from './services/services.module';

@Module({
  imports: [
    DatabaseModule, // 👈 NECESARIO para TypeORM global
    UsersModule,
    AuthModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
