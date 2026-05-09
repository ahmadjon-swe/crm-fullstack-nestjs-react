import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive, IsString } from 'class-validator';
import { LessonTime } from 'src/shared/enums/lesson-time.enum';
import { WeekDays } from 'src/shared/enums/week-days.enum';


export class CreateGroupDto {
  @ApiProperty({ example: 'Math-A' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  direction: string;

  @ApiProperty({ enum: WeekDays, example: WeekDays.ODD })
  @IsEnum(WeekDays)
  week_days: WeekDays;

  @ApiProperty({ enum: LessonTime, example: LessonTime.MORNING })
  @IsEnum(LessonTime)
  lesson_time: LessonTime;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @IsPositive()
  monthly_fee: number;

  @ApiProperty({ example: 1, description: 'Teacher ID' })
  @IsNumber()
  teacher_id: number;
}
