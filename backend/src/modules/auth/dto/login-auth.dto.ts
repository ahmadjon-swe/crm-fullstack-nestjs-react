import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: 'johnadmin or john@example.com' })
  @IsString()
  login: string;

  @ApiProperty({ example: 'securePass123' })
  @IsString()
  password: string;
}
