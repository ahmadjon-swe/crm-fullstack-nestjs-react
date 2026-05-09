import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { AttendanceStatus } from 'src/shared/enums/attendance-status.enum';

export class CreateAttendanceDto {
  @ApiProperty({ example: 1, description: 'Student ID' })
  @IsNumber()
  student_id: number;

  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNumber()
  group_id: number;

  @ApiProperty({ example: '2025-05-08' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}
