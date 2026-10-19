import db from '../config/db.mjs';

const Absensi = {
    getAll: async () => {
        const query = `
            SELECT a.*, k.nama, k.email, k.posisi, k.avatar 
            FROM absensi a
            JOIN karyawan k ON a.karyawan_id = k.id
            ORDER BY a.tanggal DESC, a.jam_masuk DESC
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    getToday: async (tanggal) => {
        const query = `
            SELECT a.*, k.nama, k.email, k.posisi, k.avatar 
            FROM absensi a
            JOIN karyawan k ON a.karyawan_id = k.id
            WHERE a.tanggal = ?
            ORDER BY a.jam_masuk DESC
        `;
        const [rows] = await db.execute(query, [tanggal]);
        return rows;
    },

    getTodayByKaryawan: async (karyawanId, tanggal) => {
        const query = `
            SELECT * FROM absensi 
            WHERE karyawan_id = ? AND tanggal = ?
            LIMIT 1
        `;
        const [rows] = await db.execute(query, [karyawanId, tanggal]);
        return rows[0] || null;
    },

    getHistoryByKaryawan: async (karyawanId, limit = 10) => {
        const query = `
            SELECT * FROM absensi 
            WHERE karyawan_id = ? 
            ORDER BY tanggal DESC, jam_masuk DESC 
            LIMIT ?
        `;
        const [rows] = await db.execute(query, [karyawanId, Number(limit)]);
        return rows;
    },

    clockIn: async (data) => {
        const {
            karyawan_id,
            tanggal,
            jam_masuk,
            status = 'Tepat Waktu',
            lokasi_masuk = 'Dalam Radius Kantor (Graha Pratama Lt. 8)',
            catatan = 'Hadir di kantor'
        } = data;

        const query = `
            INSERT INTO absensi (karyawan_id, tanggal, jam_masuk, status, lokasi_masuk, catatan)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [karyawan_id, tanggal, jam_masuk, status, lokasi_masuk, catatan]);
        return result.insertId;
    },

    clockOut: async (id, data) => {
        const {
            jam_pulang,
            durasi_kerja,
            lokasi_pulang = 'Dalam Radius Kantor (Graha Pratama Lt. 8)',
            catatan
        } = data;

        const query = `
            UPDATE absensi 
            SET jam_pulang = ?,
                durasi_kerja = ?,
                lokasi_pulang = ?,
                catatan = COALESCE(?, catatan)
            WHERE id = ?
        `;
        const [result] = await db.execute(query, [jam_pulang, durasi_kerja, lokasi_pulang, catatan || null, id]);
        return result.affectedRows;
    },

    getAdminStats: async (tanggal) => {
        const [totalKaryawanRows] = await db.execute('SELECT COUNT(*) as total FROM karyawan');
        const [hadirHariIniRows] = await db.execute("SELECT COUNT(*) as hadir FROM absensi WHERE tanggal = ?", [tanggal]);
        const [tepatWaktuRows] = await db.execute("SELECT COUNT(*) as tepat_waktu FROM absensi WHERE tanggal = ? AND status = 'Tepat Waktu'", [tanggal]);
        const [terlambatRows] = await db.execute("SELECT COUNT(*) as terlambat FROM absensi WHERE tanggal = ? AND status = 'Terlambat'", [tanggal]);
        const [izinRows] = await db.execute("SELECT COUNT(*) as izin_cuti FROM izin WHERE ? BETWEEN tanggal_mulai AND tanggal_selesai AND status = 'Disetujui'", [tanggal]);

        return {
            totalKaryawan: totalKaryawanRows[0]?.total || 0,
            hadirHariIni: hadirHariIniRows[0]?.hadir || 0,
            tepatWaktuHariIni: tepatWaktuRows[0]?.tepat_waktu || 0,
            terlambatHariIni: terlambatRows[0]?.terlambat || 0,
            izinCutiHariIni: izinRows[0]?.izin_cuti || 0
        };
    },

    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM absensi WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

export default Absensi;
