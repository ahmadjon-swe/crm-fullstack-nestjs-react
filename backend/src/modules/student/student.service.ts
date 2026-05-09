import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(@InjectRepository(Student) private studentRepo: Repository<Student>) {}

  async create(dto: CreateStudentDto) {
    const exists = await this.studentRepo.findOne({ where: { phone: dto.phone } });
    if (exists) throw new BadRequestException('Phone already registered');

    const student = this.studentRepo.create(dto);
    return this.studentRepo.save(student);
  }

  async findAll() {
    return this.studentRepo.find({ relations: ['groups'] });
  }

  async findAllDeleted() {
    return this.studentRepo.find({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
      relations: ['groups'],
    });
  }

  async findOne(id: number) {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['groups', 'payments', 'attendances'],
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async update(id: number, dto: UpdateStudentDto) {
    const student = await this.findOne(id);
    if (dto.phone && dto.phone !== student.phone) {
      const exists = await this.studentRepo.findOne({ where: { phone: dto.phone } });
      if (exists) throw new BadRequestException('Phone already registered');
    }
    Object.assign(student, dto);
    return this.studentRepo.save(student);
  }

  async remove(id: number) {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['attendances', 'payments'],
    });
    if (!student) throw new NotFoundException('Student not found');

    // Remove attendances and payments (except keep balance)
    // attendances cascade delete on softDelete won't work so we clear relations
    await this.studentRepo.softDelete(id);
    return { message: 'Student deleted' };
  }

  async restore(id: number) {
    const student = await this.studentRepo.findOne({ where: { id }, withDeleted: true });
    if (!student) throw new NotFoundException('Student not found');
    student.deletedAt = undefined;
    await this.studentRepo.save(student);
    return { message: 'Student restored' };
  }

  // --- Debtors for current month ---
  async getDebtors() {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const students = await this.studentRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.groups', 'g')
      .leftJoinAndSelect('s.payments', 'p', 'p.month = :month AND p.type = :type', {
        month,
        type: 'charge',
      })
      .where('s.deletedAt IS NULL')
      .getMany();

    return students
      .filter((s) => s.groups.length > 0)
      .map((s) => {
        const totalFee = s.groups.reduce((sum, g) => sum + Number(g.monthly_fee), 0);
        const paid = s.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const debt = totalFee - paid;
        return {
          id: s.id,
          name: s.name,
          phone: s.phone,
          balance: s.balance,
          totalFee,
          paid,
          debt,
          isDebtor: debt > 0,
          month,
        };
      })
      .filter((s) => s.isDebtor);
  }
}
