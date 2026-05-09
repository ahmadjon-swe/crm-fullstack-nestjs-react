// ─── Enums ────────────────────────────────────────────────────────────────────
export type RolesAdmin = 'superadmin' | 'admin';
export type WeekDays = 'odd' | 'even';
export type LessonTime = '10:00-12:00' | '14:30-16:30' | '17:00-19:00';
export type PaymentMethod = 'cash' | 'card' | 'transfer';
export type PaymentType = 'deposit' | 'charge' | 'refund';
export type AttendanceStatus = 'present' | 'absent' | 'late';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface Admin {
  id: number;
  username: string;
  name: string;
  email: string;
  role: RolesAdmin;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  message: string;
}

export interface VerifyResponse {
  message: string;
  data: Pick<Admin, 'id' | 'name' | 'email' | 'role'>;
  tokens: AuthTokens;
}

// ─── Teacher ──────────────────────────────────────────────────────────────────
export interface Teacher {
  id: number;
  name: string;
  phone: string;
  direction: string;
  image?: string;
  groups?: Group[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// ─── Student ──────────────────────────────────────────────────────────────────
export interface Student {
  id: number;
  name: string;
  phone: string;
  parent_name: string;
  parent_phone: string;
  balance: number;
  groups?: Group[];
  payments?: Payment[];
  attendances?: Attendance[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// ─── Group ────────────────────────────────────────────────────────────────────
export interface Group {
  id: number;
  name: string;
  direction: string;
  week_days: WeekDays;
  lesson_time: LessonTime;
  monthly_fee: number;
  teacher?: Teacher;
  students?: Student[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export interface Payment {
  id: number;
  amount: number;
  method: PaymentMethod;
  type: PaymentType;
  description?: string;
  month: string;
  student?: Student;
  admin?: Admin | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentReportItem {
  student_id: number;
  name: string;
  phone: string;
  balance: number;
  totalFee: number;
  totalPaid: number;
  debt: number;
  status: 'paid' | 'debt';
  month: string;
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export interface Attendance {
  id: number;
  date: string;
  status: AttendanceStatus;
  student?: Student;
  group?: Group;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceMonthlyStats {
  group_id: number;
  group_name: string;
  month: string;
  students: {
    student_id: number;
    name: string;
    present: number;
    absent: number;
    late: number;
    total: number;
  }[];
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalGroups: number;
  totalTeachers: number;
  totalStudents: number;
  totalLeftStudents: number;
  newStudentsThisMonth: number;
  leftStudentsThisMonth: number;
}

export interface MonthlyStatItem {
  label: string;
  year: number;
  month: number;
  newStudents: number;
  activeStudents: number;
  leftStudents: number;
  leftPercent: number;
}

// ─── API Helpers ──────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
