import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Auth } from './modules/auth/entities/auth.entity';
import { Teacher } from './modules/teacher/entities/teacher.entity';
import { Student } from './modules/student/entities/student.entity';
import { Group } from './modules/group/entities/group.entity';
import { Payment } from './modules/payment/entities/payment.entity';
import { Attendance } from './modules/attendance/entities/attendance.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Auth, Teacher, Student, Group, Payment, Attendance],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
