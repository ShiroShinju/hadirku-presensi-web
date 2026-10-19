import Karyawan from '../models/karyawanModel.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/authMiddleware.mjs';

// Mengambil semua data karyawan (tanpa field password)
export const getSemuaKaryawan = async (req, res) => {
    try {
        const karyawan = await Karyawan.getAll();
        const safeKaryawan = karyawan.map(({ password, ...rest }) => rest);
        res.status(200).json({
            message: 'Berhasil mengambil seluruh data karyawan! 📋',
            data: safeKaryawan
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mengambil karyawan berdasarkan ID (tanpa field password)
export const getKaryawanById = async (req, res) => {
    try {
        const { id } = req.params;
        const karyawan = await Karyawan.getById(id);

        if (!karyawan) {
            return res.status(404).json({ message: 'Karyawan tidak ditemukan 😢' });
        }

        const { password, ...safeKaryawan } = karyawan;
        res.status(200).json({
            message: 'Data karyawan ditemukan! ✨',
            data: safeKaryawan
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Menambahkan karyawan baru (dengan hashing password)
export const tambahKaryawan = async (req, res) => {
    try {
        const { nama, email, posisi, avatar, role, password } = req.body;

        if (!nama || !email || !posisi) {
            return res.status(400).json({ message: 'Nama, email, dan posisi wajib diisi! ⚠️' });
        }

        const existing = await Karyawan.getByEmail(email);
        if (existing) {
            return res.status(400).json({ message: 'Email sudah terdaftar untuk karyawan lain! ⚠️' });
        }

        const rawPassword = password && password.trim() ? password.trim() : '123456';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        const newId = await Karyawan.create({
            nama,
            email,
            posisi,
            avatar,
            role,
            password: hashedPassword
        });

        res.status(201).json({
            message: 'Karyawan baru berhasil ditambahkan! 🎉',
            data: { id: newId, nama, email, posisi, avatar, role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Memperbarui data karyawan
export const updateKaryawan = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, email, posisi, avatar, role, password } = req.body;

        let hashedPassword = undefined;
        if (password && password.trim()) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password.trim(), salt);
        }

        const affected = await Karyawan.update(id, {
            nama,
            email,
            posisi,
            avatar,
            role,
            password: hashedPassword
        });

        if (affected === 0) {
            return res.status(404).json({ message: 'Karyawan tidak ditemukan untuk diperbarui 😢' });
        }

        res.status(200).json({
            message: 'Data karyawan berhasil diperbarui! ✨',
            data: { id, nama, email, posisi, avatar, role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Menghapus data karyawan
export const hapusKaryawan = async (req, res) => {
    try {
        const { id } = req.params;
        const affected = await Karyawan.delete(id);

        if (affected === 0) {
            return res.status(404).json({ message: 'Karyawan tidak ditemukan untuk dihapus 😢' });
        }

        res.status(200).json({ message: 'Data karyawan berhasil dihapus! 🗑️' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login aman dengan verifikasi bcrypt dan pembuatan JWT Token
export const loginKaryawan = async (req, res) => {
    try {
        const { email, nip, password, role } = req.body;
        const targetIdentifier = (email || nip || '').trim();

        if (!targetIdentifier) {
            return res.status(400).json({ message: 'Silakan masukkan email atau NIP Anda!' });
        }

        if (!password || !password.trim()) {
            return res.status(400).json({ message: 'Silakan masukkan kata sandi akun Anda!' });
        }

        // Cari karyawan berdasarkan email atau ID/NIP
        let user = await Karyawan.getByEmail(targetIdentifier);
        if (!user && !isNaN(targetIdentifier) && targetIdentifier !== '') {
            user = await Karyawan.getById(parseInt(targetIdentifier));
        }

        if (!user) {
            return res.status(401).json({ message: 'Email/NIP atau kata sandi tidak sesuai! 🔒' });
        }

        // Verifikasi kesesuaian portal role jika tab ditentukan
        if (role && user.role !== role) {
            return res.status(403).json({
                message: `Akun ini adalah role '${user.role.toUpperCase()}', silakan beralih ke tab '${role === 'admin' ? 'Karyawan' : 'Admin / HR'}' untuk masuk.`
            });
        }

        // Verifikasi kata sandi dengan bcrypt
        const isMatch = await bcrypt.compare(password.trim(), user.password || '');
        if (!isMatch) {
            return res.status(401).json({ message: 'Email/NIP atau kata sandi tidak sesuai! 🔒' });
        }

        // Buat JWT Token aman (berlaku 24 jam)
        const payload = {
            id: user.id,
            nama: user.nama,
            email: user.email,
            posisi: user.posisi,
            role: user.role
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

        // Hilangkan hash kata sandi dari response
        const { password: _, ...userSafe } = user;

        res.status(200).json({
            message: `Login berhasil! Selamat datang, ${user.nama}. 👋`,
            token,
            data: userSafe
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
