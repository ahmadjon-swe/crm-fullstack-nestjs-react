import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'Bobur Rahimov', description: "Student's full name" })
  @IsString()
  name: string;

  @ApiProperty({ example: '+998901234567', description: 'Unique phone number' })
  @IsString()
  @Matches(/^\+998\d{9}$/, { message: 'Phone must be in +998XXXXXXXXX format' })
  phone: string;

  @ApiProperty({ example: 'Rahimov Akbar', description: "Parent's full name" })
  @IsString()
  parent_name: string;

  @ApiProperty({ example: '+998909876543', description: "Parent's phone number" })
  @IsString()
  @Matches(/^\+998\d{9}$/, { message: 'Parent phone must be in +998XXXXXXXXX format' })
  parent_phone: string;
}
