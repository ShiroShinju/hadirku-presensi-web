import Izin from '../models/izinModel.mjs';

// Mengambil semua permohonan izin (untuk Admin/HR)
export const getSemuaIzin = async (req, res) => {
    try {
        const data = await Izin.getAll();
        res.status(200).json({
            message: 'Berhasil memuat daftar permohonan izin! 📑',
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mengambil riwayat izin satu karyawan
export const getIzinByKaryawan = async (req, res) => {
    try {
        const { karyawanId } = req.params;
        const data = await Izin.getByKaryawan(karyawanId);
        res.status(200).json({
            message: 'Riwayat pengajuan izin berhasil dimuat! 📋',
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mengajukan izin / cuti baru (Karyawan)
export const ajukanIzin = async (req, res) => {
    try {
        const { karyawan_id, tanggal_mulai, tanggal_selesai, tipe, alasan } = req.body;

        if (!karyawan_id || !tanggal_mulai || !tanggal_selesai) {
            return res.status(400).json({ message: 'Karyawan ID, tanggal mulai, dan tanggal selesai wajib diisi! ⚠️' });
        }

        const newId = await Izin.create({
            karyawan_id,
            tanggal_mulai,
            tanggal_selesai,
            tipe: tipe || 'Cuti Tahunan',
            alasan: alasan || ''
        });

        res.status(201).json({
            message: 'Pengajuan izin/cuti berhasil dikirim ke Tim HR! :3',
            data: { id: newId, karyawan_id, tanggal_mulai, tanggal_selesai, tipe, alasan, status: 'Menunggu' }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update status izin (Setujui / Tolak oleh Admin HR)
export const updateStatusIzin = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Menunggu', 'Disetujui', 'Ditolak'].includes(status)) {
            return res.status(400).json({ message: 'Status harus bernilai "Menunggu", "Disetujui", atau "Ditolak"! ⚠️' });
        }

        const affected = await Izin.updateStatus(id, status);

        if (affected === 0) {
            return res.status(404).json({ message: 'Pengajuan izin tidak ditemukan! 😕' });
        }

        res.status(200).json({
            message: `Status izin berhasil diperbarui menjadi ${status}! ✨`,
            data: { id, status }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Hapus pengajuan izin
export const hapusIzin = async (req, res) => {
    try {
        const { id } = req.params;
        const affected = await Izin.delete(id);

        if (affected === 0) {
            return res.status(404).json({ message: 'Pengajuan izin tidak ditemukan 😕' });
        }

        res.status(200).json({ message: 'Pengajuan izin berhasil dihapus! 🗑️' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
