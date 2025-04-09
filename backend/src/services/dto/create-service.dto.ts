import {
    IsString,
    IsOptional,
    IsNumber,
    IsPositive,
    IsInt,
  } from 'class-validator';
  
  export class CreateServiceDto {
    @IsString()
    name: string;
  
    @IsString()
    @IsOptional()
    description?: string;
  
    @IsNumber()
    @IsPositive()
    price: number;
  
    @IsString()
    @IsOptional()
    imageUrl?: string;
  
    @IsString()
    @IsOptional()
    availability?: string;
  
    @IsInt()
    categoryId: number;
  
    @IsString()
    @IsOptional()
    categoryName?: string; // Podrías omitir esto si el category se selecciona por ID
  }
  