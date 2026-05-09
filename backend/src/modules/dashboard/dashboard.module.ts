import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from 'src/modules/student/entities/student.entity';
import { Teacher } from 'src/modules/teacher/entities/teacher.entity';
import { Group } from 'src/modules/group/entities/group.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Teacher, Group])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
