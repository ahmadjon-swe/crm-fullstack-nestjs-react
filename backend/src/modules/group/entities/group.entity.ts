import { BaseEntity } from 'src/database/entities/base-entity';
import { GROUP_LIST_RELATIONS, GROUP_DETAIL_RELATIONS } from 'src/database/relations/group.relations';
import { WeekDays } from 'src/shared/enums/week-days.enum';
import { LessonTime } from 'src/shared/enums/lesson-time.enum';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Teacher } from 'src/modules/teacher/entities/teacher.entity';
import { Student } from 'src/modules/student/entities/student.entity';
import { Attendance } from 'src/modules/attendance/entities/attendance.entity';

@Entity('group')
export class Group extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  direction!: string;

  @Column({ type: 'enum', enum: WeekDays })
  week_days!: WeekDays;

  @Column({ type: 'enum', enum: LessonTime })
  lesson_time!: LessonTime;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthly_fee!: number;

  @ManyToOne(() => Teacher, (teacher) => teacher.groups, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @ManyToMany(() => Student, (student) => student.groups)
  @JoinTable({
    name: 'group_students',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'student_id', referencedColumnName: 'id' },
  })
  students: Student[];

  @OneToMany(() => Attendance, (attendance) => attendance.group)
  attendances: Attendance[];
}

// Export relations used by this entity
export { GROUP_LIST_RELATIONS, GROUP_DETAIL_RELATIONS };
