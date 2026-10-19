import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('FATAL KEAMANAN: Environment variable JWT_SECRET belum diset di .env!');
    process.exit(1);
}

// 1. Rate Limiter Ketat untuk Mencegah Brute Force Login
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 10, // Maksimal 10 percobaan login per IP dalam 15 menit
    message: {
        message: 'Terlalu banyak percobaan login gagal dari IP Anda. Demi keamanan, coba lagi dalam 15 menit.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// 2. Rate Limiter Umum untuk API
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300, // 300 request per 15 menit per IP
    message: {
        message: 'Batas kuota request tercapai, silakan coba lagi beberapa saat lagi.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// 3. Middleware untuk memverifikasi token JWT pada Authorization header
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Akses ditolak: Token autentikasi tidak disertakan atau tidak valid.'
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({
            message: 'Token otentikasi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.'
        });
    }
};

// 4. Middleware verifikasi role Admin / HR
export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Akses ditolak: Hanya administrator atau HR yang diizinkan.'
        });
    }
    next();
};

// 5. Middleware Proteksi IDOR (Insecure Direct Object Reference)
// Memastikan user non-admin hanya bisa mengakses/melihat data milik dirinya sendiri
export const requireOwnerOrAdmin = (paramName = 'karyawanId') => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Autentikasi diperlukan.' });
    }

    if (req.user.role === 'admin') {
        return next();
    }

    const rawId = req.params[paramName] || req.params.id || req.body?.karyawan_id;
    const targetId = parseInt(rawId, 10);

    if (req.user.id === targetId) {
        return next();
    }

    return res.status(403).json({
        message: 'Akses ditolak: Anda hanya diizinkan mengakses data presensi/profil milik Anda sendiri.'
    });
};

// 6. Enforce User Context (Mencegah "Titip Absen" atau Manipulasi ID Karyawan Lain pada POST)
export const enforceUserContext = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Autentikasi diperlukan.' });
    }

    // Jika user bukan admin, paksa karyawan_id sesuai dengan ID pengguna login di token JWT
    if (req.user.role !== 'admin') {
        req.body.karyawan_id = req.user.id;
    } else if (!req.body.karyawan_id) {
        req.body.karyawan_id = req.user.id;
    }

    next();
};

// 7. Cegah Eskalasi Hak Akses (Role Escalation)
export const preventRoleEscalation = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Autentikasi diperlukan.' });
    }

    // Karyawan biasa tidak boleh mengubah role dirinya atau orang lain menjadi admin
    if (req.user.role !== 'admin' && req.body && req.body.role) {
        delete req.body.role;
    }

    next();
};
