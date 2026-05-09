import { BaseEntity } from 'src/database/entities/base-entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Student } from 'src/modules/student/entities/student.entity';
import { Auth } from 'src/modules/auth/entities/auth.entity';
import { PaymentMethod } from 'src/shared/enums/payment-method.enum';
import { PaymentType } from 'src/shared/enums/payment-type.unum';



@Entity('payment')
export class Payment extends BaseEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
  method!: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.DEPOSIT })
  type!: PaymentType;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  // e.g. "2025-05"
  @Column({ type: 'varchar', length: 7 })
  month!: string;

  @ManyToOne(() => Student, (student) => student.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Auth, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  admin: Auth | null;
}
