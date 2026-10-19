import express from 'express';
import {
    getSemuaAbsensi,
    getAbsensiHariIni,
    getStatusHariIni,
    getRiwayatKaryawan,
    absenMasuk,
    absenPulang,
    getStatistikAdmin,
    hapusAbsensi
} from '../controllers/absensiController.mjs';
import {
    verifyToken,
    requireAdmin,
    requireOwnerOrAdmin,
    enforceUserContext
} from '../middleware/authMiddleware.mjs';

const router = express.Router();

// Seluruh rute absensi mewajibkan token JWT yang valid
router.use(verifyToken);

// 1. Rute Statistik Admin HR
router.get('/statistik', requireAdmin, getStatistikAdmin);

// 2. Rute Presensi Hari Ini (Live Monitoring divisi hanya untuk Admin)
router.get('/hari-ini', requireAdmin, getAbsensiHariIni);

// 3. Status Presensi Hari Ini per Karyawan (Proteksi IDOR: hanya diri sendiri atau Admin)
router.get('/status-hari-ini/:karyawanId', requireOwnerOrAdmin('karyawanId'), getStatusHariIni);

// 4. Rute Riwayat Absensi per Karyawan (Proteksi IDOR: hanya diri sendiri atau Admin)
router.get('/riwayat/:karyawanId', requireOwnerOrAdmin('karyawanId'), getRiwayatKaryawan);

// 5. Rute Aksi Absensi (Clock In & Clock Out dengan proteksi enforceUserContext anti-titip absen)
router.post('/masuk', enforceUserContext, absenMasuk);
router.post('/pulang', enforceUserContext, absenPulang);

// 6. Rute Seluruh Rekap Absensi (Hanya Admin) & Hapus Absensi
router.get('/', requireAdmin, getSemuaAbsensi);
router.delete('/:id', requireAdmin, hapusAbsensi);

export default router;
