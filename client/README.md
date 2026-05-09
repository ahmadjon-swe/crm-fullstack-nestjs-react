# CRM Client — React + Vite + TypeScript

## Tezkor ishga tushirish

```bash
npm install
npm run dev     # http://localhost:5173
```

## Fayl tuzilmasi

```
src/
├── main.tsx                    — Entry point
├── App.tsx                     — Router + PrivateRoute
│
├── styles/
│   ├── tokens.css              ← BARCHA RANGLAR, FONTLAR BU YERDA
│   ├── global.css              — Reset + global stillar
│   └── components.css          — Umumiy komponent stillari
│
├── api/
│   ├── axios.ts                — Axios instance + interceptors
│   └── services.ts             — Barcha API chaqiruvlar
│
├── store/
│   ├── auth.store.ts           — Auth holati (Zustand)
│   └── ui.store.ts             — Theme, lang, sidebar
│
├── types/
│   └── index.ts                — TypeScript interfeyslari
│
├── i18n/
│   └── index.ts                — uz | ru | en tarjimalar
│
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx      — Sidebar + Header + Outlet
│   │   ├── Sidebar.tsx         — Nav menyu
│   │   └── Header.tsx          — Sana, til, tema, avatar
│   ├── shared/
│   │   ├── index.tsx           — Button, Input, Modal, Table, ...
│   │   └── shared.css
│   └── ui/
│       └── index.tsx           — Past darajali UI elementlar
│
└── pages/
    ├── auth/       — LoginPage (2 bosqich: parol + OTP)
    ├── dashboard/  — Stat kartalar + BarChart (Recharts)
    ├── teachers/   — Karta ko'rinish + CRUD modal
    ├── students/   — Jadval + CRUD modal + balans
    ├── groups/     — Karta ko'rinish + guruh detali
    ├── payments/   — To'lovlar + oylik hisobot
    ├── attendance/ — Kunlik + oylik statistika
    └── admins/     — Faqat superadmin ko'radi
```

## Dizayn tizimi

### Rebrending

`src/styles/tokens.css` — bu faylda:
- Brand ranglari (`--brand-*`)
- Accent ranglar (`--accent-danger`, `--accent-success`, ...)
- Tipografiya (`--font-sans`, `--font-mono`, `--text-*`)
- Spacing, border-radius, shadows, z-index

**Faqat shu faylni o'zgartiring** → butun sayt yangi rangda bo'ladi.

### Dark / Light mode

`data-theme="dark"` attribute `<html>` ga qo'shiladi. CSS:
```css
[data-theme="dark"] .my-class { ... }
```

### Tillar (i18n)

```ts
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
t('students')  // "O'quvchilar" | "Студенты" | "Students"
```

## Muhim komponentlar

| Komponent      | Ishlatish                                      |
|----------------|------------------------------------------------|
| `<Button>`     | variant, size, loading, icon props             |
| `<Input>`      | label, error, icon                             |
| `<Modal>`      | open, onClose, title, size (sm/md/lg/xl)       |
| `<ConfirmModal>`| onConfirm, message                            |
| `<Table<T>>`   | columns, data, rowKey, loading                 |
| `<PageHeader>` | title, count, search, onSearch, action         |
| `<Badge>`      | variant (blue/green/red/yellow/gray/purple)    |
