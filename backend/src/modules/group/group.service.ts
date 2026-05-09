import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { GROUP_LIST_RELATIONS, GROUP_DETAIL_RELATIONS } from 'src/database/relations/group.relations';
import { Student } from 'src/modules/student/entities/student.entity';
import { Teacher } from 'src/modules/teacher/entities/teacher.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group) private groupRepo: Repository<Group>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Teacher) private teacherRepo: Repository<Teacher>,
  ) {}

  async create(dto: CreateGroupDto) {
    const teacher = await this.teacherRepo.findOne({ where: { id: dto.teacher_id } });
    if (!teacher) throw new NotFoundException('Teacher not found');

    const group = this.groupRepo.create({
      name: dto.name,
      direction: dto.direction,
      week_days: dto.week_days,
      lesson_time: dto.lesson_time,
      monthly_fee: dto.monthly_fee,
      teacher,
    });
    return this.groupRepo.save(group);
  }

  async findAll() {
    return this.groupRepo.find({ relations: GROUP_LIST_RELATIONS, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const group = await this.groupRepo.findOne({ where: { id }, relations: GROUP_DETAIL_RELATIONS });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async update(id: number, dto: UpdateGroupDto) {
    const group = await this.findOne(id);
    if (dto.teacher_id) {
      const teacher = await this.teacherRepo.findOne({ where: { id: dto.teacher_id } });
      if (!teacher) throw new NotFoundException('Teacher not found');
      group.teacher = teacher;
    }
    const { teacher_id, ...rest } = dto;
    Object.assign(group, rest);
    return this.groupRepo.save(group);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.groupRepo.softDelete(id);
    return { message: 'Group deleted successfully' };
  }

  async addStudent(groupId: number, studentId: number) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['students'],
    });
    if (!group) throw new NotFoundException('Group not found');

    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    if (group.students.some((s) => s.id === studentId)) {
      throw new BadRequestException('Student is already in this group');
    }

    group.students.push(student);
    await this.groupRepo.save(group);
    return { message: 'Student added to group successfully' };
  }

  async removeStudent(groupId: number, studentId: number) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['students'],
    });
    if (!group) throw new NotFoundException('Group not found');

    const idx = group.students.findIndex((s) => s.id === studentId);
    if (idx === -1) throw new NotFoundException('Student is not in this group');

    // Delete attendance records for this student in this group
    await this.groupRepo.manager.query(
      `DELETE FROM attendance WHERE student_id = $1 AND group_id = $2`,
      [studentId, groupId],
    );

    group.students.splice(idx, 1);
    await this.groupRepo.save(group);
    return { message: 'Student removed from group (attendance cleared)' };
  }

  async getAttendanceByDate(groupId: number, date: string) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['students'],
    });
    if (!group) throw new NotFoundException('Group not found');

    const attendances = await this.groupRepo.manager.query(
      `SELECT a.id, a.status, a.date, s.id as student_id, s.name as student_name, s.phone as student_phone
       FROM attendance a
       JOIN student s ON s.id = a.student_id
       WHERE a.group_id = $1 AND a.date = $2
       ORDER BY s.name ASC`,
      [groupId, date],
    );

    return {
      group_id: groupId,
      group_name: group.name,
      date,
      total_students: group.students.length,
      marked: attendances.length,
      records: attendances,
    };
  }
}
