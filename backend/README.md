# CRM Backend — O'quv markazi

NestJS + TypeORM + PostgreSQL

## Setup

```bash
npm install
```

`.env` faylini to'ldiring:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=crm_db
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
PORT=3000
```

## Migration

```bash
# Build first
npm run build

# Run migrations
npm run migration:run
```

## Birinchi superadmin (qo'lda DB ga kiritish)

```sql
INSERT INTO auth (username, name, email, password, role)
VALUES (
  'superadmin',
  'Super Admin',
  'admin@example.com',
  '$2b$12$...',   -- bcrypt hash of your password
  'superadmin'
);
```

Yoki migration dan keyin quyidagi endpoint ishlatiladi (birinchi superadmin yaratish uchun vaqtincha guard olib tashlab):
`POST /api/auth` → keyin qaytarib qo'ying.

## Run

```bash
npm run start:dev
```

## Swagger

`http://localhost:3000/docs`

## API Endpoints

### Auth
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | — | Login (sends OTP) |
| POST | /api/auth/verify | — | Verify OTP, get tokens |
| POST | /api/auth/refresh/:id | — | Refresh access token |
| POST | /api/auth | SUPERADMIN | Create admin |
| GET | /api/auth | SUPERADMIN | All admins |
| PATCH | /api/auth/:id | SUPERADMIN | Update admin |
| DELETE | /api/auth/:id | SUPERADMIN | Delete admin |
| PATCH | /api/auth/:id/restore | SUPERADMIN | Restore admin |

### Teachers
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /api/teachers | ADMIN+ | Create |
| GET | /api/teachers | ADMIN+ | All |
| GET | /api/teachers/:id | ADMIN+ | One |
| PATCH | /api/teachers/:id | ADMIN+ | Update |
| DELETE | /api/teachers/:id | ADMIN+ | Soft delete |
| PATCH | /api/teachers/:id/restore | SUPERADMIN | Restore |

### Students
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /api/students | ADMIN+ | Create |
| GET | /api/students | ADMIN+ | All active |
| GET | /api/students/deleted | SUPERADMIN | Left students |
| GET | /api/students/debtors | ADMIN+ | Current month debtors |
| GET | /api/students/:id | ADMIN+ | One (with payments & attendance) |
| PATCH | /api/students/:id | ADMIN+ | Update |
| DELETE | /api/students/:id | ADMIN+ | Soft delete (left center) |
| PATCH | /api/students/:id/restore | SUPERADMIN | Restore |

### Groups
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /api/groups | ADMIN+ | Create |
| GET | /api/groups | ADMIN+ | All |
| GET | /api/groups/:id | ADMIN+ | One |
| PATCH | /api/groups/:id | ADMIN+ | Update |
| DELETE | /api/groups/:id | ADMIN+ | Soft delete |
| POST | /api/groups/:id/students/:studentId | ADMIN+ | Add student |
| DELETE | /api/groups/:id/students/:studentId | ADMIN+ | Remove student |
| GET | /api/groups/:id/attendance?date=YYYY-MM-DD | ADMIN+ | Attendance by date |

### Payments
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /api/payments/deposit | ADMIN+ | Add payment to student balance |
| GET | /api/payments | ADMIN+ | All payments |
| GET | /api/payments/monthly-report?month=YYYY-MM | ADMIN+ | Monthly paid/debt report |
| GET | /api/payments/student/:studentId | ADMIN+ | Student payment history |
| DELETE | /api/payments/:id | SUPERADMIN | Delete (reverses balance) |

### Attendance
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /api/attendance | ADMIN+ | Single attendance mark |
| POST | /api/attendance/bulk | ADMIN+ | Bulk attendance for group |
| GET | /api/attendance/group/:id?date=YYYY-MM-DD | ADMIN+ | By group & date |
| GET | /api/attendance/group/:id/monthly?month=YYYY-MM | ADMIN+ | Monthly stats |
| GET | /api/attendance/student/:id | ADMIN+ | Student history |
| PATCH | /api/attendance/:id | ADMIN+ | Update status |
| DELETE | /api/attendance/:id | ADMIN+ | Delete |

### Dashboard
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | /api/dashboard/stats | ADMIN+ | Groups, teachers, students, left counts |
| GET | /api/dashboard/monthly | ADMIN+ | Last 12 months student stats |

## Auto Charge (CRON)

Har oyning 1-kuni soat 00:01 da barcha aktiv o'quvchilarning balansidan
ularning guruhlari `monthly_fee` si avtomatik yechiladi va `payment` jadvaliga
`type: charge` sifatida yoziladi.
