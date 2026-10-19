DROP DATABASE IF EXISTS karyawan2_db;
CREATE DATABASE karyawan2_db;
USE karyawan2_db;

-- 1. Tabel Data Karyawan
CREATE TABLE IF NOT EXISTS karyawan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) DEFAULT NULL,
    posisi VARCHAR(50) NOT NULL,
    avatar VARCHAR(255) DEFAULT '',
    role ENUM('karyawan', 'admin') DEFAULT 'karyawan',
    tanggal_masuk TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Presensi / Absensi Karyawan
CREATE TABLE absensi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    karyawan_id INT NOT NULL,
    tanggal DATE NOT NULL,
    jam_masuk TIME NOT NULL,
    jam_pulang TIME DEFAULT NULL,
    durasi_kerja VARCHAR(50) DEFAULT NULL,
    status ENUM('Tepat Waktu', 'Terlambat', 'Pulang Cepat', 'Izin', 'Sakit', 'Cuti') NOT NULL DEFAULT 'Tepat Waktu',
    lokasi_masuk VARCHAR(255) DEFAULT 'Dalam Radius Kantor',
    lokasi_pulang VARCHAR(255) DEFAULT NULL,
    catatan VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unik_karyawan_tanggal (karyawan_id, tanggal),
    FOREIGN KEY (karyawan_id) REFERENCES karyawan(id) ON DELETE CASCADE
);

-- 3. Tabel Pengajuan Izin / Cuti / Sakit
CREATE TABLE izin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    karyawan_id INT NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    tipe VARCHAR(50) DEFAULT 'Cuti',
    alasan TEXT DEFAULT NULL,
    status ENUM('Menunggu', 'Disetujui', 'Ditolak') DEFAULT 'Menunggu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (karyawan_id) REFERENCES karyawan(id) ON DELETE CASCADE
);

-- ===================================================
-- Data Awal (Dummy Data) untuk Pengujian & Presentasi
-- ===================================================

-- Password default untuk semua akun demo: 123456 (Hashed dengan bcrypt: $2b$10$yK/dvh2n6V3RHIzH.hx.7eFFkE.qxSRieQkV2Rquvj4cLOqTdV3Xq)
INSERT INTO karyawan (id, nama, email, password, posisi, avatar, role) VALUES
(1, 'Alexsander Jajang', 'alexjajang@gmail.com', '$2b$10$yK/dvh2n6V3RHIzH.hx.7eFFkE.qxSRieQkV2Rquvj4cLOqTdV3Xq', 'Senior Software Engineer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'karyawan'),
(2, 'Siti Nurhaliza', 'siti.nurhaliza@hadirku.id', '$2b$10$yK/dvh2n6V3RHIzH.hx.7eFFkE.qxSRieQkV2Rquvj4cLOqTdV3Xq', 'UI/UX Product Designer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'karyawan'),
(3, 'Ahmad Fauzi', 'ahmad.fauzi@hadirku.id', '$2b$10$yK/dvh2n6V3RHIzH.hx.7eFFkE.qxSRieQkV2Rquvj4cLOqTdV3Xq', 'Human Resources Specialist', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'admin'),
(4, 'Dewi Lestari', 'dewi.lestari@hadirku.id', '$2b$10$yK/dvh2n6V3RHIzH.hx.7eFFkE.qxSRieQkV2Rquvj4cLOqTdV3Xq', 'Marketing Manager', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'karyawan');

-- Tambah Data Riwayat Absensi Alexsander Jajang (6 Hari Terakhir)
INSERT INTO absensi (karyawan_id, tanggal, jam_masuk, jam_pulang, durasi_kerja, status, lokasi_masuk, lokasi_pulang, catatan) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 6 DAY), '07:55:00', '17:05:00', '09j 10m', 'Tepat Waktu', 'Kantor Pusat (Radius 12m)', 'Kantor Pusat (Radius 15m)', 'Hadir di Kantor'),
(1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '08:02:00', '17:00:00', '08j 58m', 'Tepat Waktu', 'Kantor Pusat (Radius 20m)', 'Kantor Pusat (Radius 18m)', 'Hadir di kantor'),
(1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '08:18:00', '17:30:00', '09j 12m', 'Terlambat', 'Kantor Pusat (Radius 25m)', 'Kantor Pusat (Radius 22m)', 'Macet di jalan tol'),
(1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '07:50:00', '16:55:00', '09j 05m', 'Tepat Waktu', 'Kantor Pusat (Radius 10m)', 'Kantor Pusat (Radius 14m)', 'Hadir tepat waktu'),
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '08:00:00', '17:15:00', '09j 15m', 'Tepat Waktu', 'Kantor Pusat (Radius 15m)', 'Kantor Pusat (Radius 10m)', 'Hadir di kantor'),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '08:05:00', '17:10:00', '09j 05m', 'Tepat Waktu', 'Kantor Pusat (Radius 18m)', 'Kantor Pusat (Radius 12m)', 'Hadir di kantor'),
-- Absensi hari ini untuk Dewi Lestari (agar dashboard KPI admin langsung menampilkan 1 hadir tepat waktu)
(4, CURDATE(), '07:58:00', NULL, NULL, 'Tepat Waktu', 'Kantor Pusat (Radius 14m)', NULL, 'Hadir tepat waktu di kantor');

-- Tambah Data Pengajuan Izin
INSERT INTO izin (karyawan_id, tanggal_mulai, tanggal_selesai, tipe, alasan, status) VALUES
(2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Cuti Tahunan', 'Keperluan keluarga di luar kota', 'Menunggu'),
(4, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Sakit', 'Demam dan flu (disertai surat dokter)', 'Disetujui');
