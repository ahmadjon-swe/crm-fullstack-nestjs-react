import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyAuthDto {
  @ApiProperty({ example: 'johnadmin' })
  @IsString()
  login: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  otp: string;
}
