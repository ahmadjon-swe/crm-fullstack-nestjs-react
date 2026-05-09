import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @Matches(/^\+998\d{9}$/, { message: 'Phone must be in format +998XXXXXXXXX' })
  phone: string;

  @ApiPropertyOptional({ example: 'https://...' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  direction: string;
}
