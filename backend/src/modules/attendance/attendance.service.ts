import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { ATTENDANCE_GROUP_RELATIONS } from 'src/database/relations/attendance.relations';
import { Student } from 'src/modules/student/entities/student.entity';
import { Group } from 'src/modules/group/entities/group.entity';
import { Auth } from 'src/modules/auth/entities/auth.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { AttendanceStatus } from 'src/shared/enums/attendance-status.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Group) private groupRepo: Repository<Group>,
  ) {}

  async create(dto: CreateAttendanceDto, admin: Auth) {
    const student = await this.studentRepo.findOne({ where: { id: dto.student_id } });
    if (!student) throw new NotFoundException('Student not found');

    const group = await this.groupRepo.findOne({
      where: { id: dto.group_id },
      relations: ['students'],
    });
    if (!group) throw new NotFoundException('Group not found');

    if (!group.students.some((s) => s.id === dto.student_id)) {
      throw new BadRequestException('Student is not in this group');
    }

    const existing = await this.attendanceRepo.findOne({
      where: {
        student: { id: dto.student_id },
        group: { id: dto.group_id },
        date: dto.date,
      },
    });
    if (existing) throw new BadRequestException('Attendance already marked for this student on this date');

    const attendance = this.attendanceRepo.create({
      date: dto.date,
      status: dto.status ?? AttendanceStatus.PRESENT,
      student,
      group,
      admin,
    });
    return this.attendanceRepo.save(attendance);
  }

  async bulkCreate(dto: BulkAttendanceDto, admin: Auth) {
    const group = await this.groupRepo.findOne({
      where: { id: dto.group_id },
      relations: ['students'],
    });
    if (!group) throw new NotFoundException('Group not found');

    const results: Attendance[] = [];

    for (const record of dto.records) {
      const student = group.students.find((s) => s.id === record.student_id);
      if (!student) continue;

      const existing = await this.attendanceRepo.findOne({
        where: {
          student: { id: record.student_id },
          group: { id: dto.group_id },
          date: dto.date,
        },
      });

      if (existing) {
        existing.status = record.status ?? AttendanceStatus.PRESENT;
        existing.admin = admin;
        results.push(await this.attendanceRepo.save(existing));
      } else {
        const a = this.attendanceRepo.create({
          date: dto.date,
          status: record.status ?? AttendanceStatus.PRESENT,
          student,
          group,
          admin,
        });
        results.push(await this.attendanceRepo.save(a));
      }
    }

    return {
      message: 'Bulk attendance saved',
      saved: results.length,
      date: dto.date,
      group_id: dto.group_id,
    };
  }

  async findByGroup(groupId: number, date?: string) {
    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.student', 's')
      .where('a.group_id = :groupId', { groupId });

    if (date) qb.andWhere('a.date = :date', { date });

    return qb.orderBy('a.date', 'DESC').addOrderBy('s.name', 'ASC').getMany();
  }

  async findByStudent(studentId: number) {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    return this.attendanceRepo.find({
      where: { student: { id: studentId } },
      relations: ['group'],
      order: { date: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateAttendanceDto) {
    const attendance = await this.attendanceRepo.findOne({ where: { id } });
    if (!attendance) throw new NotFoundException('Attendance record not found');
    Object.assign(attendance, dto);
    return this.attendanceRepo.save(attendance);
  }

  async remove(id: number) {
    const attendance = await this.attendanceRepo.findOne({ where: { id } });
    if (!attendance) throw new NotFoundException('Attendance record not found');
    await this.attendanceRepo.remove(attendance);
    return { message: 'Attendance record deleted' };
  }

  async getMonthlyStats(groupId: number, month: string) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['students'],
    });
    if (!group) throw new NotFoundException('Group not found');

    const [year, mon] = month.split('-');
    const records = await this.attendanceRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.student', 's')
      .where('a.group_id = :groupId', { groupId })
      .andWhere(`EXTRACT(YEAR FROM a.date::date) = :year`, { year })
      .andWhere(`EXTRACT(MONTH FROM a.date::date) = :mon`, { mon })
      .orderBy('s.name', 'ASC')
      .getMany();

    const byStudent: Record<number, { name: string; present: number; absent: number; late: number }> = {};

    for (const r of records) {
      const sid = r.student.id;
      if (!byStudent[sid]) {
        byStudent[sid] = { name: r.student.name, present: 0, absent: 0, late: 0 };
      }
      byStudent[sid][r.status as keyof typeof byStudent[number]]++;
    }

    return {
      group_id: groupId,
      group_name: group.name,
      month,
      students: Object.entries(byStudent).map(([id, stats]) => ({
        student_id: +id,
        ...stats,
        total: stats.present + stats.absent + stats.late,
      })),
    };
  }
}
