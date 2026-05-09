import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: 'john_admin', description: 'Username or email address' })
  @IsString()
  login: string;

  @ApiProperty({ example: 'StrongPass@123', description: 'Admin password' })
  @IsString()
  password: string;
}
