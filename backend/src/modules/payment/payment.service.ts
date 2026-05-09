import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Student } from 'src/modules/student/entities/student.entity';
import { Auth } from 'src/modules/auth/entities/auth.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Group } from 'src/modules/group/entities/group.entity';
import { PaymentType } from 'src/shared/enums/payment-type.unum';
import { PaymentMethod } from 'src/shared/enums/payment-method.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Group) private groupRepo: Repository<Group>,
  ) {}

  // Admin deposits money to student balance
  async deposit(dto: CreatePaymentDto, admin: Auth) {
    const student = await this.studentRepo.findOne({ where: { id: dto.student_id } });
    if (!student) throw new NotFoundException('Student not found');

    student.balance = Number(student.balance) + Number(dto.amount);
    await this.studentRepo.save(student);

    const payment = this.paymentRepo.create({
      amount: dto.amount,
      method: dto.method,
      type: PaymentType.DEPOSIT,
      description: dto.description,
      month: dto.month,
      student,
      admin,
    });
    return this.paymentRepo.save(payment);
  }

  async findAll() {
    return this.paymentRepo.find({ relations: ['student', 'admin'] });
  }

  async findByStudent(studentId: number) {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');
    return this.paymentRepo.find({
      where: { student: { id: studentId } },
      relations: ['admin'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const payment = await this.paymentRepo.findOne({ where: { id }, relations: ['student', 'admin'] });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async remove(id: number) {
    const payment = await this.findOne(id);
    // Reverse balance if deposit
    if (payment.type === PaymentType.DEPOSIT) {
      const student = payment.student;
      student.balance = Number(student.balance) - Number(payment.amount);
      await this.studentRepo.save(student);
    }
    await this.paymentRepo.softDelete(id);
    return { message: 'Payment deleted' };
  }

  // Monthly payment report — who paid / who didn't
  async getMonthlyReport(month?: string) {
    const targetMonth = month ?? this.currentMonth();

    const students = await this.studentRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.groups', 'g')
      .leftJoinAndSelect('s.payments', 'p', 'p.month = :month', { month: targetMonth })
      .where('s.deletedAt IS NULL')
      .getMany();

    return students.map((s) => {
      const totalFee = s.groups.reduce((sum, g) => sum + Number(g.monthly_fee), 0);
      const totalPaid = s.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      return {
        student_id: s.id,
        name: s.name,
        phone: s.phone,
        balance: Number(s.balance),
        totalFee,
        totalPaid,
        debt: Math.max(0, totalFee - totalPaid),
        status: totalPaid >= totalFee ? 'paid' : 'debt',
        month: targetMonth,
      };
    });
  }

  // Auto-charge: runs on 1st of every month at 00:01
  @Cron('1 0 1 * *')
  async autoChargeMonthlyFees() {
    const month = this.currentMonth();
    console.log(`[CRON] Auto-charging monthly fees for ${month}`);

    const students = await this.studentRepo.find({
      relations: ['groups'],
    });

    for (const student of students) {
      if (!student.groups.length) continue;

      const totalFee = student.groups.reduce((sum, g) => sum + Number(g.monthly_fee), 0);
      if (totalFee <= 0) continue;

      // Deduct from balance
      student.balance = Number(student.balance) - totalFee;
      await this.studentRepo.save(student);

      // Record charge payment
      const payment = this.paymentRepo.create({
        amount: totalFee,
        method: PaymentMethod.TRANSFER,
        type: PaymentType.CHARGE,
        description: `Auto monthly charge for ${month}`,
        month,
        student,
        admin: null,
      });
      await this.paymentRepo.save(payment);
    }

    console.log(`[CRON] Monthly charges done for ${students.length} students`);
  }

  private currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
