import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../user.entity';
import {
  IsEmail,
  IsString,
  IsOptional,
  Matches,
  IsEnum,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  password: string;

  @ApiProperty({ example: '+34666555444', required: false })
  @Matches(/^(\+?[0-9]{7,15})$/, {
    message: 'Invalid phone number',
  })
  @IsOptional()
  phone_number?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CLIENT })
  @IsEnum(UserRole)
  role: UserRole;
}
