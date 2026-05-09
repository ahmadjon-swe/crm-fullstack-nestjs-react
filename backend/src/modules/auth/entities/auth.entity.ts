import { BaseEntity } from 'src/database/entities/base-entity';
import { RolesAdmin } from 'src/shared/enums/roles.enum';
import { Column, Entity } from 'typeorm';

@Entity('auth')
export class Auth extends BaseEntity {
  @Column({ unique: true, type: 'varchar' })
  username!: string;

  @Column()
  name!: string;

  @Column({ unique: true, type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'enum', enum: RolesAdmin, default: RolesAdmin.ADMIN })
  role!: RolesAdmin;

  @Column({ type: 'varchar', nullable: true })
  refresh_token?: string;

  @Column({ type: 'varchar', nullable: true })
  otp?: string;

  @Column({ type: 'bigint', nullable: true })
  otp_time?: number;
}
