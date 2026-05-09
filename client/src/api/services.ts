import api from './axios';
import type {
  Admin, Teacher, Student, Group, Payment, Attendance,
  PaymentReportItem, DashboardStats, MonthlyStatItem,
  AuthTokens, VerifyResponse, AttendanceMonthlyStats,
} from '@/types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (login: string, password: string) =>
    api.post<{ message: string }>('/auth/login', { login, password }),

  verify: (login: string, otp: string) =>
    api.post<VerifyResponse>('/auth/verify', { login, otp }),

  refresh: (id: number, refresh_token: string) =>
    api.post<{ tokens: AuthTokens }>(`/auth/refresh/${id}`, { refresh_token }),

  me: () => api.get<Admin>('/auth/me'),

  getAll: () => api.get<Admin[]>('/auth'),
  getDeleted: () => api.get<Admin[]>('/auth/deleted'),
  getOne: (id: number) => api.get<Admin>(`/auth/${id}`),
  create: (data: Partial<Admin> & { password: string }) => api.post<{ message: string }>('/auth', data),
  update: (id: number, data: Partial<Admin & { password: string }>) =>
    api.patch<{ message: string }>(`/auth/${id}`, data),
  remove: (id: number) => api.delete<{ message: string }>(`/auth/${id}`),
  restore: (id: number) => api.patch<{ message: string }>(`/auth/${id}/restore`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
  getMonthly: () => api.get<MonthlyStatItem[]>('/dashboard/monthly'),
};

// ─── Teachers ─────────────────────────────────────────────────────────────────
export const teacherApi = {
  getAll: () => api.get<Teacher[]>('/teachers'),
  getDeleted: () => api.get<Teacher[]>('/teachers/deleted'),
  getOne: (id: number) => api.get<Teacher>(`/teachers/${id}`),
  create: (data: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Teacher>('/teachers', data),
  update: (id: number, data: Partial<Teacher>) =>
    api.patch<Teacher>(`/teachers/${id}`, data),
  remove: (id: number) => api.delete<{ message: string }>(`/teachers/${id}`),
  restore: (id: number) => api.patch<{ message: string }>(`/teachers/${id}/restore`),
};

// ─── Students ─────────────────────────────────────────────────────────────────
export const studentApi = {
  getAll: () => api.get<Student[]>('/students'),
  getDeleted: () => api.get<Student[]>('/students/deleted'),
  getDebtors: () => api.get<any[]>('/students/debtors'),
  getOne: (id: number) => api.get<Student>(`/students/${id}`),
  create: (data: Pick<Student, 'name' | 'phone' | 'parent_name' | 'parent_phone'>) =>
    api.post<Student>('/students', data),
  update: (id: number, data: Partial<Student>) =>
    api.patch<Student>(`/students/${id}`, data),
  remove: (id: number) => api.delete<{ message: string }>(`/students/${id}`),
  restore: (id: number) => api.patch<{ message: string }>(`/students/${id}/restore`),
};

// ─── Groups ───────────────────────────────────────────────────────────────────
export const groupApi = {
  getAll: () => api.get<Group[]>('/groups'),
  getOne: (id: number) => api.get<Group>(`/groups/${id}`),
  create: (data: { name: string; direction: string; week_days: string; lesson_time: string; monthly_fee: number; teacher_id: number }) =>
    api.post<Group>('/groups', data),
  update: (id: number, data: Partial<Group & { teacher_id: number }>) =>
    api.patch<Group>(`/groups/${id}`, data),
  remove: (id: number) => api.delete<{ message: string }>(`/groups/${id}`),
  addStudent: (groupId: number, studentId: number) =>
    api.post<{ message: string }>(`/groups/${groupId}/students/${studentId}`),
  removeStudent: (groupId: number, studentId: number) =>
    api.delete<{ message: string }>(`/groups/${groupId}/students/${studentId}`),
  getAttendanceByDate: (groupId: number, date: string) =>
    api.get<any>(`/groups/${groupId}/attendance?date=${date}`),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentApi = {
  deposit: (data: { student_id: number; amount: number; method: string; month: string; description?: string }) =>
    api.post<Payment>('/payments/deposit', data),
  getAll: () => api.get<Payment[]>('/payments'),
  getMonthlyReport: (month?: string) =>
    api.get<{ month: string; report: PaymentReportItem[] }>(`/payments/monthly-report${month ? `?month=${month}` : ''}`),
  getByStudent: (studentId: number) =>
    api.get<Payment[]>(`/payments/student/${studentId}`),
  getOne: (id: number) => api.get<Payment>(`/payments/${id}`),
  remove: (id: number) => api.delete<{ message: string }>(`/payments/${id}`),
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceApi = {
  create: (data: { student_id: number; group_id: number; date: string; status?: string }) =>
    api.post<Attendance>('/attendance', data),
  bulkCreate: (data: { group_id: number; date: string; records: { student_id: number; status?: string }[] }) =>
    api.post<{ message: string; saved: number }>('/attendance/bulk', data),
  getByGroup: (groupId: number, date?: string) =>
    api.get<Attendance[]>(`/attendance/group/${groupId}${date ? `?date=${date}` : ''}`),
  getMonthlyStats: (groupId: number, month?: string) =>
    api.get<AttendanceMonthlyStats>(`/attendance/group/${groupId}/monthly${month ? `?month=${month}` : ''}`),
  getByStudent: (studentId: number) =>
    api.get<Attendance[]>(`/attendance/student/${studentId}`),
  update: (id: number, status: string) =>
    api.patch<Attendance>(`/attendance/${id}`, { status }),
  remove: (id: number) => api.delete<{ message: string }>(`/attendance/${id}`),
};
