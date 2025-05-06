import { ApiProperty } from '@nestjs/swagger';

export class PhotographerCardResponseDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'Estudio Lumière' })
  nombreEstudio: string;

  @ApiProperty({
    example:
      'https://cdn.cosmos.so/42fd99ab-6855-4fa3-b0ec-4bf6c1060175?format=jpeg',
  })
  fotografiaUrl: string;

  @ApiProperty({
    example:
      'https://cdn.cosmos.so/5e19d5e8-8eed-4a9c-adf9-80a26c276fd0?format=jpeg',
  })
//   fotoPortada: string; implementaremos portada mas adelante

  @ApiProperty({ example: 4.8 })
  puntuacion: number;

  @ApiProperty({ example: 1 })
  categoriaId: number;

  @ApiProperty({ example: 'Calle del Sol, 12, Madrid' })
  direccion: string;

  @ApiProperty({ example: 1200 })
  seguidores: number;

  @ApiProperty({ example: true })
  verificado: boolean;
}
