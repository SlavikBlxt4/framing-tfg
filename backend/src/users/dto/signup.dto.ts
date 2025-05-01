import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../user.entity';

export class SignupDto {
  @ApiProperty({ example: 'Juan Pérez' })
  name: string;

  @ApiProperty({ example: 'juan@example.com' })
  email: string;

  @ApiProperty({ example: '12345678' })
  password: string;

  @ApiProperty({ example: '+34666555444', required: false })
  phone_number?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CLIENT })
  role: UserRole;
}
