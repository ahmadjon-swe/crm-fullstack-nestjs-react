import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class VerifyAuthDto {
  @ApiProperty({ example: 'john_admin', description: 'Username or email used in login step' })
  @IsString()
  login: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code sent to email' })
  @IsString()
  @Length(6, 6)
  otp: string;
}
