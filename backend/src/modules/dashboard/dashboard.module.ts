import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Student } from 'src/modules/student/entities/student.entity';
import { Teacher } from 'src/modules/teacher/entities/teacher.entity';
import { Group } from 'src/modules/group/entities/group.entity';
import { jwtConstants } from 'src/shared/constants/jwt.contstant';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Teacher, Group]),
    JwtModule.register({ secret: jwtConstants.access_secret }),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
