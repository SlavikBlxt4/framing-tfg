import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // <- hace funcionar @Type de class-transformer
      whitelist: true, // <- elimina campos no definidos en los DTO
      forbidNonWhitelisted: true, // <- lanza error si llega un campo no permitido
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Framing API')
    .setDescription('Documentación interactiva de la API de Framing')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
