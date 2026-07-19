# ProgressFit — Integrated Fitness Monitoring System

Website manajemen fitness dan monitoring client yang dirancang khusus untuk **Personal Trainer (PT) / Admin** dan **Client**. Dibangun menggunakan **React.js (Vite)** di bagian frontend, **Express.js API** di bagian backend, dan **Prisma ORM** dengan database **MySQL** (siap dideploy ke Vercel + Railway).

---

## 🚀 Fitur Utama

### 🏋️ Dashboard Admin / Personal Trainer (PT)
1. **Dashboard Utama**: Ringkasan total client aktif, client baru, client mencapai target, status check-in, jadwal hari ini, dan leaderboard mingguan/bulanan.
2. **Data Klien**: Tambah, edit, nonaktifkan, dan cari client dengan spesifikasi fisik (TB, BB awal, target, program: Bulking/Cutting/Maintenance).
3. **Monitoring Berat Badan**: Grafik mingguan, riwayat timbangan lengkap, dan persentase estimasi target tercapai.
4. **Monitoring Lingkar Tubuh**: Log lingkar dada, pinggang, pinggul, lengan, paha, betis, dan leher secara mingguan dengan komparasi awal vs sekarang.
5. **Progress Strength**: Log beban angkatan (Bench Press, Squat, Deadlift, dll), persentase kenaikan beban, dan setting target angkatan baru dari PT.
6. **Jadwal Latihan Split**: Rancang jadwal latihan split mingguan dan fitur **Salin Jadwal** dari template klien ke klien lainnya dalam sekali klik.
7. **Target Harian Checklist**: Pantau tingkat kepatuhan (compliance rate) rutinitas klien (workout, protein, air minum, tidur, langkah).
8. **Cardio Tracker**: Laporan statistik cardio (lari, jalan, sepeda) mingguan.
9. **Reminder Otomatis**: Kirim notifikasi log timbangan atau evaluasi kepada klien secara real-time.
10. **Leaderboard Komunitas**: Peringkat penurunan berat badan terbaik, angkatan beban terbesar, durasi cardio, dll.

### 👤 Dashboard Client
* Client hanya dapat mengakses datanya sendiri (private).
* Mengisi checklist target harian, log berat badan, lingkar tubuh, log workout, dan log cardio secara mandiri.
* Melihat jadwal split latihan harian dari PT.
* Membaca pemberitahuan & menandai dibaca reminder dari PT.
* Melihat leaderboard komunitas dengan **masking anonim** (misal: `FitMember #1`) untuk menjaga privasi antar klien, namun nama sendiri terlihat jelas.

---

## 🛠️ Tech Stack & Konfigurasi Lokal

* **Frontend**: React.js (Vite), React Router v6, Tailwind CSS, Zustand (State Management), Recharts (Visualisasi Grafik), Lucide Icons.
* **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs.
* **Database**: Prisma ORM. Menggunakan **SQLite (`dev.db`)** untuk kemudahan running lokal secara instan tanpa ribet setup MySQL locally. Siap di-switch ke **MySQL** saat dideploy ke Railway.

---

## 💻 Cara Menjalankan Project Secara Lokal

### 1. Persiapan Backend
1. Masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Salin file `.env.example` menjadi `.env` (Sudah terkonfigurasi otomatis menggunakan SQLite):
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Push skema database & generate client Prisma:
   ```bash
   npx prisma db push
   ```
5. Isi database dengan data demo/dummy (Coach Rian + 3 Client Demo):
   ```bash
   npm run db:seed
   ```
6. Jalankan server backend development:
   ```bash
   npm run dev
   ```
   *Backend akan berjalan di port `3001` (http://localhost:3001).*

### 2. Persiapan Frontend
1. Masuk ke direktori `frontend`:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan server frontend Vite:
   ```bash
   npm run dev
   ```
   *Frontend akan berjalan di http://localhost:5173.*

---

## 🔑 Kredensial Uji Coba (Demo Login)

Untuk memudahkan uji coba fitur multi-role, gunakan akun demo instan berikut di halaman login:

| Role | Email | Password |
|---|---|---|
| **Admin / Personal Trainer** | `admin@progressfit.com` | `admin123` |
| **Client / Klien (Arvin)** | `arvin@gmail.com` | `client123` |
| **Client / Klien (Budi)** | `budi@gmail.com` | `client123` |

---

## 🌐 Panduan Deployment ke Vercel + Railway

### 1. Deployment Database (MySQL) & API Backend ke Railway
1. Buat database **MySQL** baru di dashboard Railway Anda.
2. Salin connection string MySQL URL yang disediakan Railway.
3. Hubungkan repositori github backend Anda ke Railway.
4. Di bagian settings backend, tambahkan variable environment berikut:
   * `DATABASE_URL`: *(Masukkan MySQL connection string dari Railway)*
   * `JWT_SECRET`: *(Kunci unik random aman untuk enkripsi JWT)*
   * `PORT`: `3001` (atau sesuaikan kebutuhan)
   * `FRONTEND_URL`: *(Masukkan URL deployment Vercel Anda nanti)*
5. Ubah baris provider database pada file `backend/prisma/schema.prisma` sebelum dideploy:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
   *(Dan kembalikan tag `@db.Date` pada field `date` model `DailyTarget` jika ingin optimasi tipe kolom MySQL Date)*.
6. Railway secara otomatis mendeteksi project Node.js dan menjalankan `npm run start`. Jangan lupa untuk menjalankan `npx prisma db push` di cloud Railway console Anda atau menambahkan command `npx prisma db push` ke `npm run build` di script deployment Anda.

### 2. Deployment Frontend ke Vercel
1. Hubungkan repositori github frontend Anda ke Vercel.
2. Atur konfigurasi Vercel:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. Tambahkan environment variable berikut pada dashboard Vercel:
   * `VITE_API_URL`: `https://[nama-app-backend-anda].railway.app/api`
4. Deploy! Vercel akan otomatis menyajikan build SPA React dengan redirect router fallback berkat konfigurasi `vercel.json` yang terpasang.
