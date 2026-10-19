import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('Menginisialisasi connection pool database MySQL... 🔌');

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'karyawan2_db',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verifikasi koneksi pool saat inisialisasi
try {
    const connection = await db.getConnection();
    console.log('Terhubung ke database MySQL via connection pool! 🚀');
    connection.release();
} catch (error) {
    console.error('Gagal terhubung ke database MySQL:', error.message);
}

export default db;