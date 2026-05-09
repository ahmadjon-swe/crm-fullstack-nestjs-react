import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RolesAdmin } from 'src/shared/enums/roles.enum';

export class UpdateAuthDto {
  @ApiProperty({ example: 'john_admin', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'NewPass@123', required: false, minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({ enum: RolesAdmin, required: false })
  @IsEnum(RolesAdmin)
  @IsOptional()
  role?: RolesAdmin;
}
