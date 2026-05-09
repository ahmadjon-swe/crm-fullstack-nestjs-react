import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PAYMENT_RELATIONS } from 'src/database/relations/payment.relations';
import { Student } from 'src/modules/student/entities/student.entity';
import { Auth } from 'src/modules/auth/entities/auth.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Cron } from '@nestjs/schedule';
import { Group } from 'src/modules/group/entities/group.entity';
import { PaymentType } from 'src/shared/enums/payment-type.enum';
import { PaymentMethod } from 'src/shared/enums/payment-method.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Group) private groupRepo: Repository<Group>,
  ) {}

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
    return this.paymentRepo.find({
      relations: PAYMENT_RELATIONS,
      order: { createdAt: 'DESC' },
    });
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
    const payment = await this.paymentRepo.findOne({ where: { id }, relations: PAYMENT_RELATIONS });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async remove(id: number) {
    const payment = await this.findOne(id);
    // Reverse balance if it was a deposit
    if (payment.type === PaymentType.DEPOSIT) {
      const student = payment.student;
      student.balance = Math.max(0, Number(student.balance) - Number(payment.amount));
      await this.studentRepo.save(student);
    }
    await this.paymentRepo.softDelete(id);
    return { message: 'Payment deleted and balance reversed' };
  }

  async getMonthlyReport(month?: string) {
    const targetMonth = month ?? this.currentMonth();

    const students = await this.studentRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.groups', 'g')
      .leftJoinAndSelect('s.payments', 'p', 'p.month = :month AND p.type = :type', {
        month: targetMonth,
        type: PaymentType.DEPOSIT,
      })
      .where('s.deletedAt IS NULL')
      .orderBy('s.name', 'ASC')
      .getMany();

    return {
      month: targetMonth,
      report: students.map((s) => {
        const totalFee = s.groups.reduce((sum, g) => sum + Number(g.monthly_fee), 0);
        const totalPaid = s.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const debt = Math.max(0, totalFee - Number(s.balance));
        return {
          student_id: s.id,
          name: s.name,
          phone: s.phone,
          balance: Number(s.balance),
          totalFee,
          totalPaid,
          debt,
          status: Number(s.balance) >= totalFee ? 'paid' : 'debt',
          month: targetMonth,
        };
      }),
    };
  }

  /** Auto-charge monthly fees: 1st of every month at 00:01 */
  @Cron('1 0 1 * *')
  async autoChargeMonthlyFees() {
    const month = this.currentMonth();
    console.log(`[CRON] Auto-charging monthly fees for ${month}`);

    const students = await this.studentRepo.find({ relations: ['groups'] });

    for (const student of students) {
      if (!student.groups.length) continue;

      const totalFee = student.groups.reduce((sum, g) => sum + Number(g.monthly_fee), 0);
      if (totalFee <= 0) continue;

      student.balance = Number(student.balance) - totalFee;
      await this.studentRepo.save(student);

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

    console.log(`[CRON] Done. Charged ${students.length} students for ${month}`);
  }

  private currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
