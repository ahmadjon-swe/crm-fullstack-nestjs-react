import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ example: 'Alisher Qodirov', description: "Teacher's full name" })
  @IsString()
  name: string;

  @ApiProperty({ example: '+998901234567', description: 'Unique phone number' })
  @IsString()
  @Matches(/^\+998\d{9}$/, { message: 'Phone must be in +998XXXXXXXXX format' })
  phone: string;

  @ApiProperty({ example: 'Matematika', description: "Teacher's subject/direction" })
  @IsString()
  direction: string;

  @ApiProperty({ example: 'uploads/teacher.jpg', description: 'Profile image path', required: false })
  @IsString()
  @IsOptional()
  image?: string;
}
