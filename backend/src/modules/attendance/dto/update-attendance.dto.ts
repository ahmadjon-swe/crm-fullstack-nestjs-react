import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AttendanceStatus } from 'src/shared/enums/attendance-status.enum';

export class UpdateAttendanceDto {
  @ApiProperty({ enum: AttendanceStatus, description: 'New attendance status' })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}
