import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Student } from 'src/modules/student/entities/student.entity';
import { Teacher } from 'src/modules/teacher/entities/teacher.entity';
import { Group } from 'src/modules/group/entities/group.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Teacher) private teacherRepo: Repository<Teacher>,
    @InjectRepository(Group) private groupRepo: Repository<Group>,
  ) {}

  async getMainStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalGroups,
      totalTeachers,
      totalStudents,
      totalLeftStudents,
      newStudentsThisMonth,
      leftStudentsThisMonth,
    ] = await Promise.all([
      this.groupRepo.count(),
      this.teacherRepo.count(),
      this.studentRepo.count(),
      this.studentRepo.count({ where: { deletedAt: Not(IsNull()) }, withDeleted: true }),
      this.studentRepo.count({
        where: {
          createdAt: Between(monthStart, monthEnd),
        },
      }),
      this.studentRepo
        .createQueryBuilder('s')
        .withDeleted()
        .where('s.deletedAt >= :start AND s.deletedAt <= :end', {
          start: monthStart,
          end: monthEnd,
        })
        .getCount(),
    ]);

    return {
      totalGroups,
      totalTeachers,
      totalStudents,
      totalLeftStudents,
      newStudentsThisMonth,
      leftStudentsThisMonth,
    };
  }

  async getMonthlyStudentStats() {
    const months = this.getLast12Months();

    const results = await Promise.all(
      months.map(async ({ year, month, label }) => {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const [newStudents, leftStudents, activeStudents] = await Promise.all([
          this.studentRepo
            .createQueryBuilder('s')
            .withDeleted()
            .where('s.createdAt >= :start AND s.createdAt <= :end', { start: startDate, end: endDate })
            .getCount(),

          this.studentRepo
            .createQueryBuilder('s')
            .withDeleted()
            .where('s.deletedAt >= :start AND s.deletedAt <= :end', { start: startDate, end: endDate })
            .getCount(),

          this.studentRepo
            .createQueryBuilder('s')
            .withDeleted()
            .where('s.createdAt <= :end', { end: endDate })
            .andWhere('(s.deletedAt IS NULL OR s.deletedAt > :end)', { end: endDate })
            .getCount(),
        ]);

        const leftPercent =
          activeStudents + leftStudents > 0
            ? Math.round((leftStudents / (activeStudents + leftStudents)) * 100)
            : 0;

        return { label, year, month, newStudents, activeStudents, leftStudents, leftPercent };
      }),
    );

    return results;
  }

  private getLast12Months() {
    const months: { year: number; month: number; label: string }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleString('uz-UZ', { month: 'short', year: '2-digit' }),
      });
    }
    return months;
  }
}

// TypeORM Between operator
function Between(start: Date, end: Date) {
  return require('typeorm').Between(start, end);
}
