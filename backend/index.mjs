import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import karyawanRoutes from './routes/karyawanRoutes.mjs';
import absensiRoutes from './routes/absensiRoutes.mjs';
import izinRoutes from './routes/izinRoutes.mjs';
import db from './config/db.mjs';

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Middleware Keamanan Helmet (Security HTTP Headers)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Middleware CORS dengan Whitelist Origin
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use(cors({
    origin: (origin, callback) => {
        // Izinkan request tanpa origin (seperti pengujian curl, Postman/REST client lokal)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Akses diblokir oleh kebijakan keamanan CORS HadirKu'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 3. Middleware Parsing JSON dengan batasan ukuran body (Mencegah Denial of Service)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. Menyajikan file statis dari folder 'public' jika ada
app.use(express.static(path.join(__dirname, 'public')));

// 5. Rute Pemeriksaan Kesehatan Server (Health Check Aman)
app.get('/api/health', async (req, res) => {
    try {
        await db.execute('SELECT 1');
        res.status(200).json({
            status: 'online',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            status: 'degraded',
            database: 'disconnected',
            error: process.env.NODE_ENV === 'production' ? 'Database connection error' : err.message
        });
    }
});

// 6. Rute API HadirKu
app.use('/api/karyawan', karyawanRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/izin', izinRoutes);

// 7. Rute dasar untuk memeriksa status server
app.get('/', (req, res) => {
    res.status(200).send(`
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; border-radius: 16px; max-width: 600px; margin: 50px auto; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <h1 style="color: #006e28; margin-bottom: 8px;">✨ HadirKu API Server Berjalan! ✨</h1>
            <p style="font-size: 16px; line-height: 1.6;">Sistem RESTful Backend untuk Portal Absensi & Presensi Mandiri (Aman & Terenkripsi).</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p><strong>Status Layanan:</strong></p>
            <ul>
                <li>Cek Kesehatan: <a href="/api/health"><code>/api/health</code></a></li>
                <li>Port: <code>${PORT}</code></li>
                <li>Mode: <code>${process.env.NODE_ENV || 'development'}</code></li>
            </ul>
        </div>
    `);
});

// 8. Global Error Handler (Menangani error CORS & unhandled errors tanpa kebocoran stack trace)
app.use((err, req, res, next) => {
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({ error: err.message });
    }
    const isProd = process.env.NODE_ENV === 'production';
    res.status(500).json({
        error: isProd ? 'Terjadi kesalahan internal server.' : err.message
    });
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server HadirKu berjalan di http://localhost:${PORT} 🚀`);
});
