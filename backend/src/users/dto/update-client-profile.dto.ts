import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateClientProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @Matches(/^(\+?[0-9]{7,15})$/, {
    message: 'Invalid phone number',
  })
  phone_number?: string;

  @IsOptional()
  @IsString()
  url_profile_image?: string;
}
