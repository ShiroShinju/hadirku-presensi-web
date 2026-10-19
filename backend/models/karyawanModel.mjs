import db from '../config/db.mjs';

const Karyawan = {
    getAll: async () => {
        const [rows] = await db.execute('SELECT * FROM karyawan ORDER BY id ASC');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM karyawan WHERE id = ?', [id]);
        return rows[0] || null;
    },

    getByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM karyawan WHERE LOWER(email) = LOWER(?)', [email]);
        return rows[0] || null;
    },

    create: async (data) => {
        const { nama, email, posisi, avatar = '', role = 'karyawan', password = '' } = data;
        const [result] = await db.execute(
            'INSERT INTO karyawan (nama, email, posisi, avatar, role, password) VALUES (?, ?, ?, ?, ?, ?)',
            [nama, email, posisi, avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', role || 'karyawan', password]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { nama, email, posisi, avatar = '', role = 'karyawan', password } = data;
        if (password) {
            const [result] = await db.execute(
                'UPDATE karyawan SET nama = ?, email = ?, posisi = ?, avatar = ?, role = ?, password = ? WHERE id = ?',
                [nama, email, posisi, avatar, role, password, id]
            );
            return result.affectedRows;
        } else {
            const [result] = await db.execute(
                'UPDATE karyawan SET nama = ?, email = ?, posisi = ?, avatar = ?, role = ? WHERE id = ?',
                [nama, email, posisi, avatar, role, id]
            );
            return result.affectedRows;
        }
    },

    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM karyawan WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

export default Karyawan;
