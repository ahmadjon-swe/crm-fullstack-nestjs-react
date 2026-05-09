import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'Alice Smith' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @Matches(/^\+998\d{9}$/, { message: 'Phone must be in format +998XXXXXXXXX' })
  phone: string;

  @ApiProperty({ example: 'Robert Smith' })
  @IsString()
  parent_name: string;

  @ApiProperty({ example: '+998907654321' })
  @IsString()
  @Matches(/^\+998\d{9}$/, { message: 'Phone must be in format +998XXXXXXXXX' })
  parent_phone: string;
}
