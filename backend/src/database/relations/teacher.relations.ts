import { OneToMany } from 'typeorm';

/**
 * Teacher → Group relation definition
 * Used in Teacher entity to load groups
 */
export const teacherGroupsRelation = () =>
  OneToMany(
    () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Group } = require('src/modules/group/entities/group.entity');
      return Group;
    },
    (group: any) => group.teacher,
  );

export const TEACHER_RELATIONS = ['groups'];
export type TeacherRelation = (typeof TEACHER_RELATIONS)[number];
