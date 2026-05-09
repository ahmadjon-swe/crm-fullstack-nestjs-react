import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDateString, IsEnum, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { AttendanceStatus } from 'src/shared/enums/attendance-status.enum';


export class AttendanceRecordDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  student_id: number;

  @ApiProperty({ enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}

export class BulkAttendanceDto {
  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNumber()
  group_id: number;

  @ApiProperty({ example: '2025-05-08' })
  @IsDateString()
  date: string;

  @ApiProperty({ type: [AttendanceRecordDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}
