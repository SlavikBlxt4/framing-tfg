import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePhotographerProfileDto {
  @ApiPropertyOptional({ description: 'Nuevo nombre del fotógrafo' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Nueva contraseña del fotógrafo (mínimo 6 caracteres)' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ description: 'Nuevo número de teléfono' })
  @IsOptional()
  @Matches(/^(\+?[0-9]{7,15})$/, {
    message: 'Invalid phone number',
  })
  phone_number?: string;

  @ApiPropertyOptional({ description: 'Nueva descripción del perfil del fotógrafo' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ description: 'Latitud de la nueva ubicación del fotógrafo', example: 40.4168 })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitud de la nueva ubicación del fotógrafo', example: -3.7038 })
  @IsOptional()
  @IsLongitude()
  longitude?: number;
}
