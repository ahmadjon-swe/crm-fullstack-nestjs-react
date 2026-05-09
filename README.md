# 🎓 O'quv Markazi CRM

O'quv markazlari uchun to'liq boshqaruv tizimi. NestJS + React (Vite) + TypeScript.

---

## 📁 Loyiha tuzilmasi

```
crm-project/
├── backend/          — NestJS REST API
├── client/           — React (Vite) SPA
├── package.json      — Root scripts
└── README.md
```

---

## 🚀 Tez ishga tushirish

### 1. Talablar

| Tool        | Versiya  |
|-------------|----------|
| Node.js     | ≥ 18     |
| PostgreSQL  | ≥ 14     |
| npm         | ≥ 9      |

### 2. Backend sozlash

```bash
cd backend

# 1. .env yaratish
cp .env.example .env
# .env faylini to'ldiring (DB, JWT, va h.k.)

# 2. Paketlarni o'rnatish
npm install

# 3. Birinchi superadminni yaratish
npm run seed:superadmin

# 4. Dev serverini ishga tushirish
npm run start:dev
```

> Swagger: http://localhost:3000/api-docs

### 3. Client sozlash

```bash
cd client

# 1. Paketlarni o'rnatish
npm install

# 2. Dev serverini ishga tushirish
npm run dev
```

> App: http://localhost:5173

### 4. Ikkisini birga ishga tushirish (root)

```bash
# Root papkada
npm install
npm run dev          # backend + client parallel
npm run build        # ikkisini build qilish
```

---

## 🔐 Autentifikatsiya oqimi

```
1. POST /api/auth/login   → username + password → OTP email'ga yuboriladi
2. POST /api/auth/verify  → OTP → access_token + refresh_token
3. Har so'rovda: Authorization: Bearer <access_token>
```

---

## 👥 Rollar

| Rol         | Huquqlar                                                   |
|-------------|-----------------------------------------------------------|
| `superadmin`| Barcha + adminlarni boshqarish, o'chirish, tiklash        |
| `admin`     | O'qituvchi, guruh, talaba, to'lov, davomat boshqarish     |

**Birinchi superadmin** — deploy vaqtida `.env` da `SUPERADMIN_*` qiymatlarini to'ldiring va `npm run seed:superadmin` buyrug'ini ishga tushiring.

---

## 📡 API Endpointlar (qisqacha)

| Modul      | Prefix           | Asosiy amallar                              |
|------------|------------------|---------------------------------------------|
| Auth       | `/api/auth`      | login, verify, refresh, CRUD (superadmin)   |
| Teachers   | `/api/teachers`  | CRUD, soft-delete, restore                  |
| Students   | `/api/students`  | CRUD, debtors, soft-delete, restore         |
| Groups     | `/api/groups`    | CRUD, student add/remove, attendance        |
| Payments   | `/api/payments`  | deposit, monthly-report, history            |
| Attendance | `/api/attendance`| single, bulk (upsert), monthly stats        |
| Dashboard  | `/api/dashboard` | stats, monthly chart data                   |

To'liq dokumentatsiya: **Swagger** (`/api-docs`)

---

## 🎨 Frontend sahifalar

| Yo'l               | Sahifa                            |
|--------------------|-----------------------------------|
| `/login`           | Login (2-bosqich: parol + OTP)    |
| `/dashboard`       | Bosh sahifa — statistika, grafik  |
| `/teachers`        | O'qituvchilar (karta ko'rinish)   |
| `/students`        | O'quvchilar (jadval)              |
| `/students/left`   | Tark etganlar                     |
| `/groups`          | Guruhlar (karta ko'rinish)        |
| `/groups/:id`      | Guruh detali — davomat + to'lov   |
| `/payments`        | To'lovlar + oylik hisobot         |
| `/attendance`      | Davomat (kunlik + oylik)          |
| `/admins`          | Adminlar (faqat superadmin)       |

---

## 🎨 Dizayn tizimi

Barcha **ranglar, fontlar, o'lchamlar** bitta joyda:

```
client/src/styles/tokens.css
```

**Rebrending** uchun faqat shu faylni o'zgartiring — butun sayt o'zgaradi.

### Light / Dark rejim

Header yoki Login sahifasidagi 🌙/☀️ tugmasi orqali almashtiriladi. Sozlama `localStorage`'da saqlanadi.

### Tillar

`uz` (default) · `ru` · `en` — Header'dagi til tanlash orqali.

---

## 🗄️ Ma'lumotlar bazasi

**PostgreSQL** — TypeORM orqali.

### Asosiy jadvallar

```
auth          — adminlar (role: superadmin | admin)
teacher       — o'qituvchilar
student       — o'quvchilar (balance maydoni bilan)
group         — guruhlar
group_students— many-to-many: guruh ↔ talaba
payment       — to'lovlar (deposit / charge / refund)
attendance    — davomat yozuvlari
```

### Entity relations fayllari

Relationlar **entity ichida emas**, alohida fayllarda:

```
backend/src/database/relations/
  ├── teacher.relations.ts
  ├── student.relations.ts
  ├── group.relations.ts
  ├── payment.relations.ts
  └── attendance.relations.ts
```

---

## ⏰ Cron vazifalar

| Vazifa               | Vaqt              | Tavsif                                 |
|----------------------|-------------------|----------------------------------------|
| Oylik to'lov yechish | Har oy 1-si 00:01 | Har student balansidan `monthly_fee` yechiladi |

---

## 🛠 Muhim buyruqlar

```bash
# Backend
npm run start:dev          # Watch rejim
npm run start:prod         # Production
npm run seed:superadmin    # Birinchi superadmin yaratish
npm run migration:generate # Yangi migration yaratish
npm run migration:run      # Migrationlarni ishga tushirish
npm run build              # Build

# Client
npm run dev                # Dev server
npm run build              # Production build
npm run preview            # Build natijasini ko'rish
```

---

## 📝 Muhit o'zgaruvchilari

Barcha kerakli o'zgaruvchilar `backend/.env.example` faylida ko'rsatilgan.

---

## 🔧 Texnologiyalar

**Backend:** NestJS · TypeORM · PostgreSQL · JWT · bcrypt · Swagger · node-schedule

**Frontend:** React 18 · Vite · TypeScript · Zustand · React Query · React Router v6 · Recharts · i18next · Lucide Icons
