export const ATTENDANCE_RELATIONS = ['student', 'group', 'admin'];
export type AttendanceRelation = (typeof ATTENDANCE_RELATIONS)[number];

export const ATTENDANCE_GROUP_RELATIONS = ['student'];
export const ATTENDANCE_STUDENT_RELATIONS = ['group'];
