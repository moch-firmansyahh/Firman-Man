# FirmanMan - Personal Productivity & Finance Management App

## 1. Deskripsi Singkat

FirmanMan adalah aplikasi web personal yang dirancang untuk membantu pengelolaan diri sendiri, khususnya untuk seorang programmer yang punya banyak aktivitas paralel. Aplikasi ini menggabungkan dua kebutuhan utama.

Yang pertama adalah manajemen keuangan pribadi, mencakup pencatatan pemasukan dan pengeluaran harian. Yang kedua adalah manajemen produktivitas, berupa to do list yang bisa dikaitkan dengan progres tugas kuliah maupun proyek pribadi.

Aplikasi ini dibuat berbasis web namun tetap responsif dan bisa diakses secara nyaman dari HP, sehingga terasa seperti aplikasi mobile meskipun teknologinya tetap web app biasa (bukan native).

## 2. Fitur Utama

### 2.1 Modul Keuangan
- Pencatatan pemasukan (income)
- Pencatatan pengeluaran (expense)
- Kategori transaksi, seperti makan, transport, kebutuhan kuliah, hiburan, tabungan
- Ringkasan saldo bulanan
- Grafik pengeluaran vs pemasukan
- Filter transaksi berdasarkan tanggal dan kategori

### 2.2 Modul Produktivitas (To Do List)
- Tambah, edit, hapus task
- Prioritas task, misalnya low, medium, high
- Status task, misalnya belum dikerjakan, sedang dikerjakan, selesai
- Deadline dan reminder
- Kategori task, misalnya kuliah, tugas besar, personal project

### 2.3 Modul Dashboard
- Ringkasan keuangan hari ini dan bulan ini
- Ringkasan task yang mendekati deadline
- Statistik progres task mingguan

### 2.4 Modul Autentikasi
- Register dan login
- JWT based authentication
- Reset password

## 3. Rekomendasi Tech Stack

### 3.1 Frontend
- Next.js sebagai framework utama, karena mendukung SSR, routing yang rapi, dan performanya bagus untuk aplikasi yang dipakai di HP
- TypeScript untuk keamanan tipe data
- Tailwind CSS untuk styling cepat dan konsisten
- Shadcn UI untuk komponen yang sudah terstruktur rapi
- Zustand atau React Query untuk state management dan data fetching
- Recharts untuk visualisasi grafik keuangan

### 3.2 Backend
- Node.js dengan Express sebagai REST API
- Prisma sebagai ORM
- PostgreSQL sebagai database utama, bisa pakai Supabase supaya deploy dan maintenance lebih ringan
- JWT untuk autentikasi
- Zod untuk validasi input

### 3.3 Tools Pendukung
- ESLint dan Prettier untuk menjaga konsistensi kode
- Husky untuk pre commit hook, supaya kode yang masuk ke repo sudah lolos lint dan format
- Docker, opsional, untuk containerize backend supaya konsisten di semua environment

## 4. Rekomendasi Platform Deploy

- Frontend Next.js di deploy ke Vercel, karena native support dan gratis untuk skala personal project
- Backend Express di deploy ke Railway atau Render, keduanya mendukung Node.js dan gampang dipakai untuk pemula
- Database PostgreSQL menggunakan Supabase, karena sudah termasuk auth, storage, dan database dalam satu platform, jadi bisa lebih hemat effort
- Untuk penyimpanan file, misalnya foto profil user, bisa memakai Supabase Storage

## 5. Struktur Folder Frontend

```
firmanman-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── finance/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [transactionId]/
│   │   │   │       └── page.tsx
│   │   │   ├── todos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [todoId]/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── finance/
│   │   │   ├── transaction-form.tsx
│   │   │   ├── transaction-list.tsx
│   │   │   └── finance-chart.tsx
│   │   ├── todos/
│   │   │   ├── todo-form.tsx
│   │   │   ├── todo-list.tsx
│   │   │   └── todo-item.tsx
│   │   └── shared/
│   │       ├── navbar.tsx
│   │       ├── sidebar.tsx
│   │       └── loading-spinner.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── use-transactions.ts
│   │   └── use-todos.ts
│   ├── store/
│   │   ├── auth-store.ts
│   │   └── finance-store.ts
│   └── types/
│       ├── transaction.ts
│       ├── todo.ts
│       └── user.ts
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 6. Struktur Folder Backend

```
firmanman-backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── transaction.controller.ts
│   │   └── todo.controller.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── transaction.routes.ts
│   │   └── todo.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── transaction.service.ts
│   │   └── todo.service.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── transaction.validator.ts
│   │   └── todo.validator.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── response.ts
│   ├── config/
│   │   └── prisma.ts
│   └── app.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env
├── tsconfig.json
├── package.json
└── server.ts
```

## 7. Alur Fitur Secara Detail

### 7.1 Alur Autentikasi
1. User membuka halaman register, mengisi nama, email, password
2. Data dikirim ke endpoint POST /api/auth/register
3. Backend melakukan validasi lewat Zod, kemudian hash password memakai bcrypt
4. User baru disimpan ke database lewat Prisma
5. User diarahkan ke halaman login
6. Saat login, backend mengecek kredensial, lalu membuat JWT token
7. Token disimpan di cookie httpOnly supaya lebih aman dari serangan XSS

### 7.2 Alur Modul Keuangan
1. User membuka halaman finance
2. Frontend mengambil data transaksi lewat GET /api/transactions dengan query filter tanggal dan kategori
3. User bisa menambah transaksi baru lewat form, data dikirim ke POST /api/transactions
4. Backend memvalidasi tipe transaksi, apakah pemasukan atau pengeluaran, lalu simpan ke database
5. Frontend menampilkan ulang list transaksi dan mengupdate grafik ringkasan
6. Setiap transaksi bisa diedit lewat PUT /api/transactions/:id dan dihapus lewat DELETE /api/transactions/:id

### 7.3 Alur Modul To Do List
1. User membuka halaman todos
2. Frontend mengambil data task lewat GET /api/todos
3. User menambah task baru dengan judul, deadline, prioritas, dan kategori, lalu dikirim ke POST /api/todos
4. User bisa mengubah status task, misalnya dari belum dikerjakan menjadi selesai, lewat PATCH /api/todos/:id/status
5. Task yang mendekati deadline akan muncul di dashboard sebagai reminder

### 7.4 Alur Dashboard
1. Saat user login dan masuk ke dashboard, frontend memanggil beberapa endpoint sekaligus, yaitu ringkasan keuangan bulanan dan ringkasan task mendekati deadline
2. Data ditampilkan dalam bentuk kartu ringkasan dan grafik kecil
3. Dashboard berfungsi sebagai halaman pusat supaya user tidak perlu berpindah pindah halaman untuk cek kondisi keuangan dan progres task

## 8. Contoh Skema Database (Prisma)

```prisma
model User {
  id           String        @id @default(uuid())
  name         String
  email        String        @unique
  password     String
  transactions Transaction[]
  todos        Todo[]
  createdAt    DateTime      @default(now())
}

model Transaction {
  id        String   @id @default(uuid())
  type      String
  amount    Int
  category  String
  note      String?
  date      DateTime
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

model Todo {
  id        String   @id @default(uuid())
  title     String
  priority  String
  status    String
  category  String
  deadline  DateTime?
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

## 9. Rencana Pengembangan Bertahap

1. Setup project frontend dan backend, konfigurasi database, dan autentikasi dasar
2. Bangun modul keuangan, mulai dari CRUD transaksi sampai grafik ringkasan
3. Bangun modul to do list, mulai dari CRUD task sampai reminder deadline
4. Bangun dashboard yang menggabungkan data dari kedua modul
5. Optimasi tampilan responsif supaya nyaman dipakai di HP
6. Testing menyeluruh, baik unit test di backend maupun manual testing di frontend
7. Deploy frontend ke Vercel dan backend ke Railway atau Render, database di Supabase

## 10. Catatan Tambahan

Karena FirmanMan berbasis web app, agar terasa seperti aplikasi HP, sebaiknya diterapkan konsep PWA (Progressive Web App). Dengan begini, user bisa install aplikasi ke home screen HP, dan aplikasi tetap terasa ringan tanpa perlu bikin versi native terpisah.
