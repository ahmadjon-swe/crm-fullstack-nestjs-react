# CRM Backend — NestJS

O'quv markazi boshqaruv tizimi (CRM) uchun backend.

## Texnologiyalar
- **NestJS** (Node.js framework)
- **TypeORM** + **PostgreSQL**
- **JWT** (access + refresh token)
- **Swagger** (to'liq API dokumentatsiya)
- **bcrypt** (parol xeshlash)
- **@nestjs/schedule** (oylik avtomatik to'lov CRON)

## Tezkor ishga tushirish

```bash
# 1. .env faylini sozlash
cp .env.example .env
# .env ni to'ldiring (DB, JWT, MAIL ma'lumotlari)

# 2. Bog'liqliklarni o'rnatish
npm install

# 3. Birinchi superadmin yaratish
npm run seed:superadmin

# 4. Ishga tushirish (dev)
npm run start:dev

# API:    http://localhost:3000/api
# Swagger: http://localhost:3000/api-docs
```

## Fayl tuzilmasi

```
src/
├── common/
│   ├── decorators/        # @Roles() decorator
│   ├── guards/            # AuthGuard, RolesGuard
│   └── swagger/           # Swagger response decorators
├── database/
│   ├── entities/          # BaseEntity (id, createdAt, updatedAt, deletedAt)
│   ├── migrations/        # TypeORM migratsiyalar
│   └── relations/         # Entity relation konstantalar (alohida faylda)
├── modules/
│   ├── auth/              # Login, OTP verify, JWT token
│   ├── teacher/           # O'qituvchilar CRUD
│   ├── student/           # O'quvchilar CRUD + qarzkorlar
│   ├── group/             # Guruhlar + student add/remove + davomat
│   ├── payment/           # To'lovlar + oylik hisobot + CRON
│   ├── attendance/        # Davomat (single + bulk) + oylik statistika
│   └── dashboard/         # Bosh sahifa statistikasi
├── scripts/
│   └── seed-superadmin.ts # Birinchi superadmin yaratish
└── shared/
    ├── constants/         # JWT konstantalar
    ├── enums/             # RolesAdmin, WeekDays, LessonTime, PaymentMethod, PaymentType, AttendanceStatus
    └── utils/             # Yordamchi funksiyalar
```

## API Endpointlar (qisqacha)

| Method | URL | Tavsif |
|--------|-----|--------|
| POST | /api/auth/login | Login → OTP yuboradi |
| POST | /api/auth/verify | OTP → token |
| POST | /api/auth/refresh/:id | Token yangilash |
| GET | /api/auth/me | Profilim |
| GET | /api/dashboard/stats | Bosh sahifa statistikasi |
| GET | /api/dashboard/monthly | 12 oylik grafik ma'lumot |
| CRUD | /api/teachers | O'qituvchilar |
| CRUD | /api/students | O'quvchilar |
| CRUD | /api/groups | Guruhlar |
| POST | /api/groups/:id/students/:sid | Guruhga o'quvchi qo'shish |
| DELETE | /api/groups/:id/students/:sid | Guruhdan chiqarish |
| POST | /api/payments/deposit | Balansga pul qo'shish |
| GET | /api/payments/monthly-report | Oylik to'lov hisoboti |
| POST | /api/attendance/bulk | Guruh davomatini belgilash |
| GET | /api/attendance/group/:id/monthly | Oylik davomat statistikasi |

To'liq dokumentatsiya: `http://localhost:3000/api-docs`

## Rollar

| Amal | ADMIN | SUPERADMIN |
|------|-------|------------|
| O'qituvchi/Guruh/Talaba CRUD | ✅ | ✅ |
| To'lov qo'shish | ✅ | ✅ |
| Davomat belgilash | ✅ | ✅ |
| Adminlarni boshqarish | ❌ | ✅ |
| Soft-delete tiklash | ❌ | ✅ |
