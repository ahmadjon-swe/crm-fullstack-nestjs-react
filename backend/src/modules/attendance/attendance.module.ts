import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance } from './entities/attendance.entity';
import { Student } from 'src/modules/student/entities/student.entity';
import { Group } from 'src/modules/group/entities/group.entity';
import { jwtConstants } from 'src/shared/constants/jwt.contstant';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Student, Group]),
    JwtModule.register({ secret: jwtConstants.access_secret }),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
