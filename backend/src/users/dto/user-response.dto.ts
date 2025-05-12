import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ required: false })
  phone_number?: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty({ required: false })
  url_profile_image?: string;
}
