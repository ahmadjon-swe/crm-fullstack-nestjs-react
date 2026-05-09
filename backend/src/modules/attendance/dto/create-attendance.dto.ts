import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { AttendanceStatus } from 'src/shared/enums/attendance-status.enum';

export class CreateAttendanceDto {
  @ApiProperty({ example: 1, description: 'Student ID' })
  @IsNumber()
  student_id: number;

  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNumber()
  group_id: number;

  @ApiProperty({ example: '2025-05-09', description: 'Attendance date (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: AttendanceStatus, default: AttendanceStatus.PRESENT, required: false })
  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;
}
