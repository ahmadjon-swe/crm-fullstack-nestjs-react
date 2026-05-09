import { BaseEntity } from 'src/database/entities/base-entity';
import { TEACHER_RELATIONS } from 'src/database/relations/teacher.relations';
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

  // Relation defined using TEACHER_RELATIONS constant
  @OneToMany(() => Group, (group) => group.teacher)
  groups: Group[];
}

// Export relations used by this entity
export { TEACHER_RELATIONS };
