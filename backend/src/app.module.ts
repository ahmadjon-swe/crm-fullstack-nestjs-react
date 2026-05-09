import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { Auth } from './modules/auth/entities/auth.entity';
import { Teacher } from './modules/teacher/entities/teacher.entity';
import { Student } from './modules/student/entities/student.entity';
import { Group } from './modules/group/entities/group.entity';
import { Payment } from './modules/payment/entities/payment.entity';
import { Attendance } from './modules/attendance/entities/attendance.entity';

import { AuthModule } from './modules/auth/auth.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { StudentModule } from './modules/student/student.module';
import { GroupModule } from './modules/group/group.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      username: process.env.DB_USERNAME ?? 'postgres',
      port: Number(process.env.DB_PORT) || 5432,
      host: process.env.DB_HOST ?? 'localhost',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Auth, Teacher, Student, Group, Payment, Attendance],
      synchronize: false,
      migrations: ['dist/database/migrations/*.js'],
      logging: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    TeacherModule,
    StudentModule,
    GroupModule,
    PaymentModule,
    AttendanceModule,
    DashboardModule,
  ],
})
export class AppModule {}
