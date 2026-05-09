import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { AttendanceStatus } from 'src/shared/enums/attendance-status.enum';

export class AttendanceRecordDto {
  @ApiProperty({ example: 1, description: 'Student ID' })
  @IsNumber()
  student_id: number;

  @ApiProperty({ enum: AttendanceStatus, default: AttendanceStatus.PRESENT, required: false })
  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;
}

export class BulkAttendanceDto {
  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNumber()
  group_id: number;

  @ApiProperty({ example: '2025-05-09', description: 'Date for all records (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiProperty({ type: [AttendanceRecordDto], description: 'Per-student attendance records' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}
