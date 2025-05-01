import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'juan@example.com' })
  email: string;

  @ApiProperty({ example: '12345678' })
  password: string;
}
