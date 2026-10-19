import express from 'express';
import {
    getSemuaKaryawan,
    getKaryawanById,
    tambahKaryawan,
    updateKaryawan,
    hapusKaryawan,
    loginKaryawan
} from '../controllers/karyawanController.mjs';
import {
    verifyToken,
    requireAdmin,
    requireOwnerOrAdmin,
    preventRoleEscalation,
    loginLimiter
} from '../middleware/authMiddleware.mjs';

const router = express.Router();

// Autentikasi / Login (Public dengan Rate Limiting anti Brute Force)
router.post('/login', loginLimiter, loginKaryawan);

// Rute CRUD Karyawan (Memerlukan Token JWT)
// 1. Daftar seluruh karyawan hanya boleh diakses Admin
router.get('/', verifyToken, requireAdmin, getSemuaKaryawan);

// 2. Detail profil hanya boleh diakses oleh pemilik akun atau Admin
router.get('/:id', verifyToken, requireOwnerOrAdmin('id'), getKaryawanById);

// 3. Tambah karyawan baru hanya oleh Admin
router.post('/', verifyToken, requireAdmin, tambahKaryawan);

// 4. Update data karyawan: hanya pemilik akun atau Admin, dan cegah eskalasi role
router.put('/:id', verifyToken, requireOwnerOrAdmin('id'), preventRoleEscalation, updateKaryawan);

// 5. Hapus karyawan hanya oleh Admin
router.delete('/:id', verifyToken, requireAdmin, hapusKaryawan);

export default router;
