import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { TEACHER_RELATIONS } from 'src/database/relations/teacher.relations';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeacherService {
  constructor(@InjectRepository(Teacher) private teacherRepo: Repository<Teacher>) {}

  async create(dto: CreateTeacherDto) {
    const exists = await this.teacherRepo.findOne({ where: { phone: dto.phone } });
    if (exists) throw new BadRequestException('Phone number already registered');
    const teacher = this.teacherRepo.create(dto);
    return this.teacherRepo.save(teacher);
  }

  async findAll() {
    return this.teacherRepo.find({ relations: TEACHER_RELATIONS, order: { createdAt: 'DESC' } });
  }

  async findAllDeleted() {
    return this.teacherRepo.find({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
      relations: TEACHER_RELATIONS,
    });
  }

  async findOne(id: number) {
    const teacher = await this.teacherRepo.findOne({ where: { id }, relations: TEACHER_RELATIONS });
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }

  async update(id: number, dto: UpdateTeacherDto) {
    const teacher = await this.findOne(id);
    if (dto.phone && dto.phone !== teacher.phone) {
      const exists = await this.teacherRepo.findOne({ where: { phone: dto.phone } });
      if (exists) throw new BadRequestException('Phone number already registered');
    }
    Object.assign(teacher, dto);
    return this.teacherRepo.save(teacher);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.teacherRepo.softDelete(id);
    return { message: 'Teacher deleted successfully' };
  }

  async restore(id: number) {
    const teacher = await this.teacherRepo.findOne({ where: { id }, withDeleted: true });
    if (!teacher) throw new NotFoundException('Teacher not found');
    teacher.deletedAt = undefined;
    await this.teacherRepo.save(teacher);
    return { message: 'Teacher restored successfully' };
  }
}
