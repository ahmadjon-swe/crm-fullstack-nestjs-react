import { BaseEntity } from 'src/database/entities/base-entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Group } from 'src/modules/group/entities/group.entity';

@Entity('teacher')
export class Teacher extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  phone!: string;

  @Column({ type: 'varchar', nullable: true })
  image?: string;

  @Column({ type: 'varchar' })
  direction!: string;

  @OneToMany(() => Group, (group) => group.teacher)
  groups: Group[];
}
