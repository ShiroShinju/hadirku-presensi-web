import express from 'express';
import {
    getSemuaIzin,
    getIzinByKaryawan,
    ajukanIzin,
    updateStatusIzin,
    hapusIzin
} from '../controllers/izinController.mjs';
import {
    verifyToken,
    requireAdmin,
    requireOwnerOrAdmin,
    enforceUserContext
} from '../middleware/authMiddleware.mjs';

const router = express.Router();

// Seluruh rute izin mewajibkan token JWT yang valid
router.use(verifyToken);

// 1. Rute Seluruh Pengajuan Izin (Hanya Admin)
router.get('/', requireAdmin, getSemuaIzin);

// 2. Daftar Izin per Karyawan (Proteksi IDOR: hanya diri sendiri atau Admin)
router.get('/karyawan/:karyawanId', requireOwnerOrAdmin('karyawanId'), getIzinByKaryawan);

// 3. Pengajuan Izin Baru (Proteksi enforceUserContext: ID karyawan otomatis dari sesi login)
router.post('/', enforceUserContext, ajukanIzin);

// 4. Verifikasi Status Izin & Hapus (Hanya Admin)
router.put('/:id/status', requireAdmin, updateStatusIzin);
router.delete('/:id', requireAdmin, hapusIzin);

export default router;
