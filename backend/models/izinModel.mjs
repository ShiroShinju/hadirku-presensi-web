import db from '../config/db.mjs';

const Izin = {
    getAll: async () => {
        const query = `
            SELECT i.*, k.nama, k.email, k.posisi, k.avatar 
            FROM izin i
            JOIN karyawan k ON i.karyawan_id = k.id
            ORDER BY i.created_at DESC
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    getByKaryawan: async (karyawanId) => {
        const query = `
            SELECT * FROM izin 
            WHERE karyawan_id = ? 
            ORDER BY created_at DESC
        `;
        const [rows] = await db.execute(query, [karyawanId]);
        return rows;
    },

    create: async (data) => {
        const { karyawan_id, tanggal_mulai, tanggal_selesai, tipe = 'Cuti Tahunan', alasan = '' } = data;
        const query = `
            INSERT INTO izin (karyawan_id, tanggal_mulai, tanggal_selesai, tipe, alasan, status)
            VALUES (?, ?, ?, ?, ?, 'Menunggu')
        `;
        const [result] = await db.execute(query, [karyawan_id, tanggal_mulai, tanggal_selesai, tipe, alasan]);
        return result.insertId;
    },

    updateStatus: async (id, status) => {
        const query = 'UPDATE izin SET status = ? WHERE id = ?';
        const [result] = await db.execute(query, [status, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM izin WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

export default Izin;
