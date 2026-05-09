import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RolesAdmin } from 'src/shared/enums/roles.enum';

export class CreateAuthDto {
  @ApiProperty({ example: 'john_admin', description: 'Unique username for admin login' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the admin' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Unique email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass@123', description: 'Password (min 6 characters)', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: RolesAdmin, default: RolesAdmin.ADMIN, description: 'Admin role', required: false })
  @IsEnum(RolesAdmin)
  @IsOptional()
  role?: RolesAdmin;
}
