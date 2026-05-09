import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive, IsString, Min } from 'class-validator';
import { LessonTime } from 'src/shared/enums/lesson-time.enum';
import { WeekDays } from 'src/shared/enums/week-days.enum';

export class CreateGroupDto {
  @ApiProperty({ example: 'Matematika-1', description: 'Unique group name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Matematika', description: 'Subject direction' })
  @IsString()
  direction: string;

  @ApiProperty({ enum: WeekDays, description: 'odd = Du-Chor-Ju | even = Se-Pay-Sha' })
  @IsEnum(WeekDays)
  week_days: WeekDays;

  @ApiProperty({ enum: LessonTime, description: 'Lesson time slot' })
  @IsEnum(LessonTime)
  lesson_time: LessonTime;

  @ApiProperty({ example: 500000, description: 'Monthly fee in UZS' })
  @IsNumber()
  @IsPositive()
  monthly_fee: number;

  @ApiProperty({ example: 1, description: 'Teacher ID to assign' })
  @IsNumber()
  @Min(1)
  teacher_id: number;
}
