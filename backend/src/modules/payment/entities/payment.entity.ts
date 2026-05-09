import { BaseEntity } from 'src/database/entities/base-entity';
import { PAYMENT_RELATIONS } from 'src/database/relations/payment.relations';
import { PaymentMethod } from 'src/shared/enums/payment-method.enum';
import { PaymentType } from 'src/shared/enums/payment-type.enum';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Student } from 'src/modules/student/entities/student.entity';
import { Auth } from 'src/modules/auth/entities/auth.entity';

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

  /** Format: "YYYY-MM" e.g. "2025-05" */
  @Column({ type: 'varchar', length: 7 })
  month!: string;

  @ManyToOne(() => Student, (student) => student.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Auth, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  admin: Auth | null;
}

// Export relations used by this entity
export { PAYMENT_RELATIONS };
