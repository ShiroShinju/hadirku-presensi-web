# HadirKu - Sistem Presensi & Absensi Mandiri (Full-Stack)

Aplikasi Web Absensi & Portal Karyawan Modern berbasis **Design Thinking**, mengacu pada modul panduan `mysql-exp - Copy.pdf` dan arsitektur referensi `nodejs_esm`. Dilengkapi dengan autentikasi aman berbasis **Bcrypt & JWT (JSON Web Token)** serta integrasi database **MySQL**.

---

## 🌟 Fitur Utama (Berdasarkan Design Thinking)

1. **One-Click Clock-In & Clock-Out**:
   - Jam digital besar real-time sinkron (format WIB) dengan detik berjalan.
   - Deteksi Geofencing GPS browser & status radius kantor (*"Dalam Radius Kantor Graha Pratama"*).
   - Tombol **Absen Masuk** otomatis mendeteksi ketepatan waktu (Toleransi jam 08:15 WIB).
   - Dialog konfirmasi interaktif sebelum **Absen Pulang** (Feedback 3 Design Thinking).
2. **Kartu Metrik Kehadiran Hari Ini**:
   - **Jam Masuk**: Status badge *Tepat Waktu* / *Terlambat**.
   - **Jam Keluar**: Status kepulangan shift kerja.
   - **Durasi Kerja**: Dihitung otomatis secara dinamis & realtime.
3. **Riwayat Kehadiran & Kalender Pekan Ini**:
   - Kartu 7 hari terakhir dengan kode warna status (Hijau = Tepat Waktu, Oranye = Terlambat, Biru = Izin/Cuti).
   - Informasi sisa kuota cuti tahunan & total kehadiran.
4. **Form Pengajuan Izin / Cuti (Ide 5 Design Thinking)**:
   - Pengajuan cuti tahunan, sakit (surat dokter), izin keperluan mendesak, atau dinas luar kota.
   - Pelacakan status verifikasi permohonan (*Menunggu*, *Disetujui*, *Ditolak*).
5. **Dashboard Konsol HR & Admin Management**:
   - **4 Indikator KPI Utama**: Total Karyawan Aktif, Hadir Hari Ini, Terlambat, Pengajuan Cuti Menunggu.
   - **Live Monitoring Presensi**: Tabel log presensi real-time seluruh divisi.
   - **Kelola Data Karyawan (CRUD Lengkap)**: Tambah, Edit, dan Hapus Karyawan langsung ke MySQL dengan otomatisasi enkripsi password & fitur reset password.
   - **Persetujuan Cuti**: Aksi *Setujui* atau *Tolak* permohonan izin karyawan secara instan.
   - **Ekspor Rekap Bulanan**: Unduh data presensi ke format file CSV / Excel atau Cetak Dokumen Laporan (PDF).
6. **Autentikasi & Portal Keamanan (Bcrypt + JWT)**:
   - Verifikasi login email/NIP dan kata sandi menggunakan hash **Bcrypt**.
   - Pengamanan sesi menggunakan token **JWT (JSON Web Token)** dengan masa aktif 24 jam.
   - Tab switcher role *Karyawan (Portal Pribadi)* dan *Admin / HR (Manajemen Tim)* dengan validasi role otomatis.
   - **Tombol Pintas Akun Demo (Quick-Fill)** pada halaman login untuk memudahkan demonstrasi dan pengujian dalam 1 kali klik.

---

## 👥 Akun Demo & Kredensial Pengujian

Tabel `karyawan` pada file [`backend/console.sql`](file:///C:/WorkspaceBBPVP/project3/backend/console.sql) telah menyediakan data seed awal dengan password default **`123456`**:

| Role | Nama | Email / Identifier | Password Default | Akses Halaman |
| :--- | :--- | :--- | :--- | :--- |
| **Karyawan** | Alexsander Jajang | `alexjajang@gmail.com` | `123456` | Portal Presensi Karyawan (`/dashboard`) |
| **Karyawan** | Siti Nurhaliza | `siti.nurhaliza@hadirku.id` | `123456` | Portal Presensi Karyawan (`/dashboard`) |
| **Admin / HR** | Ahmad Fauzi | `ahmad.fauzi@hadirku.id` | `123456` | Konsol Manajemen HR / Admin (`/admin`) |
| **Karyawan** | Dewi Lestari | `dewi.lestari@hadirku.id` | `123456` | Portal Presensi Karyawan (`/dashboard`) |
| **Admin / HR** | Bambang Pamungkas | `bambang.pamungkas@hadirku.id` | `123456` | Konsol Manajemen HR / Admin (`/admin`) |

> 💡 **Tips Pengujian:** Pada halaman login, Anda dapat langsung mengklik tombol **👤 Alexsander (Karyawan)** atau **🛡️ Ahmad Fauzi (Admin HR)** untuk otomatis mengisi form login.

---

## 🏗️ Struktur Arsitektur Proyek

Struktur folder mengikuti arsitektur modular ES Modules (`nodejs_esm`):

```text
project3/
├── .gitignore                     # Aturan pengabaian file git (node_modules, .env, dist)
├── backend/
│   ├── config/
│   │   └── db.mjs                  # Koneksi pool mysql2/promise ke karyawan2_db
│   ├── controllers/
│   │   ├── absensiController.mjs   # Kontroler clock in/out, riwayat, statistik
│   │   ├── izinController.mjs      # Kontroler pengajuan & persetujuan cuti
│   │   └── karyawanController.mjs  # Kontroler CRUD karyawan & login auth (Bcrypt/JWT)
│   ├── middleware/
│   │   └── authMiddleware.mjs      # Middleware verifikasi JWT & otorisasi role (admin/karyawan)
│   ├── models/
│   │   ├── absensiModel.mjs        # Query database absensi
│   │   ├── izinModel.mjs           # Query database izin/cuti
│   │   └── karyawanModel.mjs       # Query database karyawan
│   ├── routes/
│   │   ├── absensiRoutes.mjs       # Router /api/absensi
│   │   ├── izinRoutes.mjs          # Router /api/izin
│   │   └── karyawanRoutes.mjs      # Router /api/karyawan & /login
│   ├── console.sql                 # DDL, struktur tabel & Seed Data MySQL
│   ├── test_api.rest               # Pengujian REST Client API dengan Bearer Token
│   ├── index.mjs                   # Entry point server Express 5 (Port 5000)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx          # Header navigasi, jam WIB, ID/EN toggle, user chip, logout
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx  # Konsol HR/Admin (KPI, CRUD Karyawan + Reset Password, Ekspor)
│   │   │   ├── EmployeeDashboard.jsx # Dashboard presensi karyawan 1-klik & metrik kehadiran
│   │   │   └── LoginPage.jsx       # Halaman login portal presensi (Bcrypt, JWT, Quick-Fill Demo)
│   │   ├── services/
│   │   │   └── api.js              # Service wrapper fetch API backend & token auth Bearer
│   │   ├── App.jsx                 # Routing React Router DOM & state sesi login
│   │   ├── index.css               # Styling Plus Jakarta Sans & utilitas
│   │   └── main.jsx
│   ├── index.html                  # Tailwind CSS & Luminous Presence design tokens
│   ├── vite.config.js              # Konfigurasi Vite & dev proxy
│   └── package.json
│
├── tampilan1/                      # Referensi mockup desain HTML awal
├── design_thinking_text_based.txt  # Dokumen spesifikasi kebutuhan sistem
└── README.md
```

---

## 🚀 Panduan Memulai & Menjalankan Aplikasi

> [!IMPORTANT]
> **Wajib untuk Pengguna Baru / Setelah Clone dari GitHub:**
> Repositori ini tidak menyertakan folder `node_modules`. Anda **harus menginstal dependensi terlebih dahulu** sebelum menjalankan aplikasi.

### Langkah 1: Clone Repositori
```bash
git clone https://github.com/ShiroShinju/project3.git
cd project3
```

---

### Langkah 2: Instalasi Dependensi (Backend & Frontend)

Anda perlu menginstal dependensi pada kedua folder (`backend` dan `frontend`):

#### 1. Instalasi Dependensi Backend
```bash
cd backend
npm install
cd ..
```

#### 2. Instalasi Dependensi Frontend
```bash
cd frontend
npm install
cd ..
```

---

### Langkah 3: Inisialisasi Database MySQL

1. Pastikan service MySQL Anda telah aktif (melalui XAMPP, Laragon, MySQL Workbench, atau WebStorm Database Tool).
2. Jalankan script SQL pada [`backend/console.sql`](file:///C:/WorkspaceBBPVP/project3/backend/console.sql) untuk membuat database `karyawan2_db`, tabel, dan seed datanya:
   ```bash
   mysql -u root -p < backend/console.sql
   ```
3. Sesuaikan kredensial koneksi database pada file [`backend/config/db.mjs`](file:///C:/WorkspaceBBPVP/project3/backend/config/db.mjs) sesuai pengaturan MySQL lokal Anda:
   ```javascript
   const db = await mysql.createConnection({
       host: 'localhost',
       user: 'root',
       password: 'your_mysql_password', // Sesuaikan dengan password MySQL Anda
       database: 'karyawan2_db'
   });
   ```

---

### Langkah 4: Menjalankan Server & Aplikasi

Gunakan dua terminal terpisah:

#### Terminal 1 — Menjalankan Backend API:
```bash
cd backend
npm run dev
```
- Server backend aktif di: **`http://localhost:5000`**
- Cek status endpoint: **`http://localhost:5000/api/health`**

#### Terminal 2 — Menjalankan Frontend React (Vite):
```bash
cd frontend
npm run dev
```
- Akses aplikasi web melalui browser di: **`http://localhost:5173`**

---

## 🧪 Pengujian Endpoint API & Client Service ([`frontend/src/services/api.js`](file:///C:/WorkspaceBBPVP/project3/frontend/src/services/api.js))

Frontend mengonsumsi API backend melalui service module [`frontend/src/services/api.js`](file:///C:/WorkspaceBBPVP/project3/frontend/src/services/api.js) dengan otomatis menyertakan header `Authorization: Bearer <jwt_token>` yang disimpan pada `sessionStorage` / `localStorage`.

Pengujian API secara langsung dapat dilakukan menggunakan file [`backend/test_api.rest`](file:///C:/WorkspaceBBPVP/project3/backend/test_api.rest) (didukung di WebStorm HTTP Client & VS Code REST Client).

### Daftar Endpoint Lengkap:

| Method | Endpoint | Fungsi di `api.js` | Akses / Auth | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | `api.checkHealth()` | Publik | Cek status online server backend |
| `POST` | `/api/karyawan/login` | `api.login(payload)` | Publik | Login & mendapatkan JWT token |
| `GET` | `/api/karyawan` | `api.getKaryawan()` | Admin | Daftar seluruh karyawan |
| `GET` | `/api/karyawan/:id` | `api.getKaryawanById(id)`| Admin / User | Detail profil karyawan |
| `POST` | `/api/karyawan` | `api.createKaryawan(payload)`| Admin | Tambah karyawan baru (hash password) |
| `PUT` | `/api/karyawan/:id` | `api.updateKaryawan(id, payload)`| Admin | Edit profil & reset password |
| `DELETE`| `/api/karyawan/:id` | `api.deleteKaryawan(id)`| Admin | Hapus karyawan |
| `GET` | `/api/absensi/statistik`| `api.getAdminStats()` | Admin | Indikator KPI Dashboard Admin |
| `GET` | `/api/absensi/hari-ini` | `api.getAbsensiHariIni()` | Admin | Log presensi hari ini |
| `GET` | `/api/absensi/status-hari-ini/:id` | `api.getStatusHariIni(id)` | User | Status masuk/pulang hari ini |
| `GET` | `/api/absensi/riwayat/:id?limit=14`| `api.getRiwayatKaryawan(id, limit)` | User | Riwayat presensi personal |
| `GET` | `/api/absensi` | `api.getAllAbsensi()` | Admin | Seluruh riwayat presensi |
| `POST` | `/api/absensi/masuk` | `api.clockIn(payload)` | User | Rekam Absen Masuk (Clock-In) |
| `POST` | `/api/absensi/pulang` | `api.clockOut(payload)` | User | Rekam Absen Pulang (Clock-Out) |
| `DELETE`| `/api/absensi/:id` | `api.deleteAbsensi(id)` | Admin | Hapus log absensi tertentu |
| `GET` | `/api/izin` | `api.getAllIzin()` | Admin | Seluruh pengajuan izin / cuti |
| `GET` | `/api/izin/karyawan/:id` | `api.getIzinByKaryawan(id)` | User | Daftar izin milik karyawan login |
| `POST` | `/api/izin` | `api.ajukanIzin(payload)` | User | Form permohonan izin baru |
| `PUT` | `/api/izin/:id/status` | `api.updateStatusIzin(id, status)` | Admin | Setujui atau Tolak izin |
| `DELETE`| `/api/izin/:id` | `api.deleteIzin(id)` | Admin | Hapus pengajuan izin |
