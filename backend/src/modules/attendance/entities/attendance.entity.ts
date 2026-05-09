import { BaseEntity } from 'src/database/entities/base-entity';
import {
  ATTENDANCE_GROUP_RELATIONS,
  ATTENDANCE_STUDENT_RELATIONS,
} from 'src/database/relations/attendance.relations';
import { AttendanceStatus } from 'src/shared/enums/attendance-status.enum';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Student } from 'src/modules/student/entities/student.entity';
import { Group } from 'src/modules/group/entities/group.entity';
import { Auth } from 'src/modules/auth/entities/auth.entity';

@Entity('attendance')
@Unique(['student', 'group', 'date'])
export class Attendance extends BaseEntity {
  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status!: AttendanceStatus;

  @ManyToOne(() => Student, (student) => student.attendances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Group, (group) => group.attendances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => Auth, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  admin: Auth;
}

// Export relations used by this entity
export { ATTENDANCE_GROUP_RELATIONS, ATTENDANCE_STUDENT_RELATIONS };
