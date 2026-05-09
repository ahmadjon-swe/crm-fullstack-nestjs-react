import { BaseEntity } from 'src/database/entities/base-entity';
import { RolesAdmin } from 'src/shared/enums/roles.enum';
import { Column, Entity } from 'typeorm';

@Entity('auth')
export class Auth extends BaseEntity {
  @Column({ unique: true, type: 'varchar' })
  username!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ unique: true, type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar', select: false })
  password!: string;

  @Column({ type: 'enum', enum: RolesAdmin, default: RolesAdmin.ADMIN })
  role!: RolesAdmin;

  @Column({ type: 'varchar', nullable: true, select: false })
  refresh_token?: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  otp?: string;

  @Column({ type: 'bigint', nullable: true, select: false })
  otp_time?: number;
}
