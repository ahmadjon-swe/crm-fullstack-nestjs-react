import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ example: 'John Admin' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'johnadmin' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePass123' })
  @IsString()
  @MinLength(6)
  password: string;
}
