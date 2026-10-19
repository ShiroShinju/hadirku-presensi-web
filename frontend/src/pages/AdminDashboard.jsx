import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function AdminDashboard({ currentUser, lang }) {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'monitoring' | 'leave' | 'employees'
    const [stats, setStats] = useState({
        totalKaryawan: 0,
        hadirHariIni: 0,
        tepatWaktuHariIni: 0,
        terlambatHariIni: 0,
        izinCutiHariIni: 0
    });
    const [attendanceList, setAttendanceList] = useState([]);
    const [karyawanList, setKaryawanList] = useState([]);
    const [leaveList, setLeaveList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // Modal state for Add/Edit Employee
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [employeeForm, setEmployeeForm] = useState({
        nama: '',
        email: '',
        posisi: '',
        avatar: '',
        role: 'karyawan',
        password: ''
    });

    // Export Dropdown state & ref for click outside
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const exportDropdownRef = useRef(null);

    useEffect(() => {
        loadAllAdminData();
    }, []);

    // Tutup dropdown jika klik di luar area dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
                setShowExportMenu(false);
            }
        };

        if (showExportMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showExportMenu]);

    const showNotice = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const loadAllAdminData = async () => {
        try {
            setLoading(true);
            const [statsRes, attRes, empRes, leaveRes] = await Promise.all([
                api.getAdminStats(),
                api.getAllAbsensi(),
                api.getKaryawan(),
                api.getAllIzin()
            ]);

            if (statsRes.data) setStats(statsRes.data);
            if (attRes.data) setAttendanceList(attRes.data);
            if (empRes.data) setKaryawanList(empRes.data);
            if (leaveRes.data) setLeaveList(leaveRes.data);
        } catch (err) {
            console.error('Error loading admin data:', err);
            showNotice('Gagal memuat data dashboard admin', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Employee CRUD
    const handleOpenAddModal = () => {
        setEditingEmployee(null);
        setEmployeeForm({
            nama: '',
            email: '',
            posisi: '',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            role: 'karyawan',
            password: ''
        });
        setShowEmployeeModal(true);
    };

    const handleOpenEditModal = (karyawan) => {
        setEditingEmployee(karyawan);
        setEmployeeForm({
            nama: karyawan.nama,
            email: karyawan.email,
            posisi: karyawan.posisi,
            avatar: karyawan.avatar,
            role: karyawan.role || 'karyawan',
            password: ''
        });
        setShowEmployeeModal(true);
    };

    const handleSaveEmployee = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...employeeForm };
            if (!payload.password || !payload.password.trim()) {
                delete payload.password;
            }

            if (editingEmployee) {
                await api.updateKaryawan(editingEmployee.id, payload);
                showNotice('Data karyawan berhasil diperbarui! ✨');
            } else {
                await api.createKaryawan(payload);
                showNotice('Karyawan baru berhasil ditambahkan! 🎉');
            }
            setShowEmployeeModal(false);
            await loadAllAdminData();
        } catch (err) {
            showNotice(err.message || 'Gagal menyimpan data karyawan.', 'error');
        }
    };

    const handleDeleteEmployee = async (id, nama) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus data karyawan "${nama}"?`)) return;
        try {
            await api.deleteKaryawan(id);
            showNotice(`Karyawan ${nama} berhasil dihapus! 🗑️`);
            await loadAllAdminData();
        } catch (err) {
            showNotice(err.message || 'Gagal menghapus karyawan.', 'error');
        }
    };

    // Leave Approval
    const handleUpdateLeaveStatus = async (id, newStatus) => {
        try {
            await api.updateStatusIzin(id, newStatus);
            showNotice(`Pengajuan izin berhasil diubah menjadi: ${newStatus}! ✨`);
            await loadAllAdminData();
        } catch (err) {
            showNotice(err.message || 'Gagal mengubah status izin.', 'error');
        }
    };

    // Delete attendance
    const handleDeleteAttendance = async (id) => {
        if (!window.confirm('Hapus log absensi ini?')) return;
        try {
            await api.deleteAbsensi(id);
            showNotice('Log absensi berhasil dihapus! 🗑️');
            await loadAllAdminData();
        } catch (err) {
            showNotice(err.message || 'Gagal menghapus absensi.', 'error');
        }
    };

    // Ekspor CSV dengan Blob & UTF-8 BOM agar rapi saat dibuka di Microsoft Excel
    const handleExportCSV = () => {
        setExportLoading(true);
        setTimeout(() => {
            const headers = ['ID', 'Nama Karyawan', 'Email', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Durasi', 'Status', 'Lokasi', 'Catatan'];
            const escapeCSV = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

            const rows = attendanceList.map(a => [
                a.id,
                escapeCSV(a.nama),
                escapeCSV(a.email),
                a.tanggal ? a.tanggal.substring(0, 10) : '',
                a.jam_masuk || '',
                a.jam_pulang || '',
                escapeCSV(a.durasi_kerja || '-'),
                escapeCSV(a.status || ''),
                escapeCSV(a.lokasi_masuk || ''),
                escapeCSV(a.catatan || '')
            ]);

            // Gunakan \uFEFF (UTF-8 BOM) agar Excel membaca karakter khusus dengan benar
            const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Rekap_Presensi_HadirKu_${new Date().toISOString().substring(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExportLoading(false);
            setShowExportMenu(false);
            showNotice('File CSV Rekap Presensi berhasil diunduh! 📊');
        }, 500);
    };

    const handlePrintReport = () => {
        setShowExportMenu(false);
        setTimeout(() => {
            window.print();
        }, 200);
    };

    return (
        <div className="w-full min-h-screen pt-20 pb-16 px-4 md:px-8 max-w-7xl mx-auto relative">
            
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(216,226,255,0.7),transparent),radial-gradient(ellipse_60%_50%_at_90%_90%,rgba(255,220,191,0.55),transparent),radial-gradient(ellipse_50%_40%_at_10%_80%,rgba(114,254,136,0.35),transparent)]"></div>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-20 right-4 z-50 max-w-md p-4 rounded-2xl shadow-xl flex items-center gap-3 border animate-bounce ${
                    notification.type === 'error'
                        ? 'bg-red-50 border-red-300 text-red-900'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}>
                    <span className="material-symbols-outlined text-[24px]">
                        {notification.type === 'error' ? 'error' : 'check_circle'}
                    </span>
                    <span className="text-xs font-semibold">{notification.msg}</span>
                </div>
            )}

            {/* Sub-bar & Welcome Executive Glass Banner */}
            {/* Catatan: overflow-hidden dihilangkan dari section agar dropdown di dalamnya tidak terpotong */}
            <section className="relative rounded-3xl bg-white/80 backdrop-blur-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.04)] border border-white p-6 sm:p-8 mb-8 mt-4">
                {/* Background glow khusus dengan overflow-hidden terisolasi */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none -z-10">
                    <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#72fe88]/20 blur-3xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-[#d8e2ff]/40 blur-2xl"></div>
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100/90 border border-gray-200 shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-[#34c759] animate-ping"></span>
                            <span className="text-xs font-bold text-[#006e28] tracking-wide uppercase">Konsol Eksekutif Aktif</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs text-gray-600">Sinkronisasi Cloud Real-Time</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Selamat Datang, Tim HR & People Operations! 🌟
                        </h1>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Konsol Manajemen Presensi & Karyawan Seluruh Divisi (Graha Pratama HQ, Hub BSD, & Remote).
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {/* Dropdown Unduh Rekap */}
                        <div className="relative" ref={exportDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-full border text-xs font-bold shadow-sm transition-all active:scale-[0.98] ${
                                    showExportMenu
                                        ? 'bg-emerald-50 border-[#34c759] text-[#006e28] ring-2 ring-emerald-200'
                                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px] text-[#006e28]">
                                    {exportLoading ? 'hourglass_top' : 'download'}
                                </span>
                                <span>{exportLoading ? 'Menyiapkan...' : 'Unduh Rekap Bulanan'}</span>
                                <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-600 font-mono">XLS/CSV</span>
                                <span className={`material-symbols-outlined text-[16px] text-gray-400 transition-transform duration-200 ${
                                    showExportMenu ? 'rotate-180 text-[#006e28]' : ''
                                }`}>
                                    expand_more
                                </span>
                            </button>

                            {/* Dropdown Menu yang tidak lagi terpotong */}
                            {showExportMenu && (
                                <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-32px)] rounded-2xl bg-white/95 backdrop-blur-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-200 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="text-xs font-bold text-gray-800 mb-2 border-b pb-2 flex items-center justify-between">
                                        <span>Pilih Format Ekspor:</span>
                                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">Otomatis</span>
                                    </div>
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            disabled={exportLoading}
                                            onClick={handleExportCSV}
                                            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-emerald-50 text-left border border-gray-200 hover:border-emerald-300 transition-all text-xs group cursor-pointer"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <span className="material-symbols-outlined text-[20px]">table_view</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 group-hover:text-emerald-900">Format Excel / CSV (.csv)</div>
                                                <div className="text-[10px] text-gray-500">Rincian log presensi lengkap & catatan</div>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handlePrintReport}
                                            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 text-left border border-gray-200 hover:border-blue-300 transition-all text-xs group cursor-pointer"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0058bc] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <span className="material-symbols-outlined text-[20px]">print</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 group-hover:text-blue-900">Cetak Dokumen Laporan (PDF)</div>
                                                <div className="text-[10px] text-gray-500">Laporan resmi siap cetak & simpan PDF</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tombol Tambah Karyawan */}
                        <button
                            type="button"
                            onClick={handleOpenAddModal}
                            className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#34c759] hover:bg-[#006e28] text-white font-bold text-xs shadow-[0_8px_20px_rgba(52,199,89,0.35)] transition-all active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                            <span>Tambah Karyawan</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* =========================================================
                4 HIGH-LEVEL KPI METRIC CARDS ROW
               ========================================================= */}\
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                
                {/* KPI 1: Total Karyawan */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white/90 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500">Total Karyawan Aktif</span>
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-[#0058bc] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">groups</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-extrabold text-gray-900">{stats.totalKaryawan || karyawanList.length}</span>
                        <span className="text-xs text-gray-500">Orang</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[13px]">trending_up</span> 100% data terintegrasi
                    </span>
                </div>

                {/* KPI 2: Hadir Hari Ini */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white/90 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500">Hadir Hari Ini (Tepat Waktu)</span>
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#006e28] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">verified_user</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-extrabold text-gray-900">{stats.tepatWaktuHariIni}</span>
                        <span className="text-xs text-emerald-700 font-bold">Karyawan</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[13px]">check</span> Hadir tepat waktu
                    </span>
                </div>

                {/* KPI 3: Terlambat */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white/90 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500">Terlambat Hari Ini</span>
                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">schedule</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-extrabold text-amber-700">{stats.terlambatHariIni}</span>
                        <span className="text-xs text-gray-500">Orang</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[13px]">info</span> Di atas jam 08:15 WIB
                    </span>
                </div>

                {/* KPI 4: Cuti / Izin */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white/90 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500">Pengecualian / Cuti</span>
                        <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">pending_actions</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-extrabold text-gray-900">{leaveList.length}</span>
                        <span className="text-xs text-gray-500">Permohonan</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[13px]">event</span> {leaveList.filter(l => l.status === 'Menunggu').length} Menunggu Verifikasi
                    </span>
                </div>

            </section>

            {/* =========================================================
                TAB NAVIGATION BAR
               ========================================================= */}
            <div className="flex items-center gap-2 mb-6 border-b border-gray-200/80 pb-2 overflow-x-auto print:hidden">
                <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'overview'
                            ? 'bg-[#34c759] text-white shadow-md'
                            : 'bg-white/80 hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">grid_view</span>
                    <span>Ringkasan & Presensi Terkini</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('employees')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'employees'
                            ? 'bg-[#34c759] text-white shadow-md'
                            : 'bg-white/80 hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                    <span>Kelola Data Karyawan ({karyawanList.length})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('leave')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'leave'
                            ? 'bg-[#34c759] text-white shadow-md'
                            : 'bg-white/80 hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">event_available</span>
                    <span>Persetujuan Cuti & Izin ({leaveList.filter(l => l.status === 'Menunggu').length})</span>
                </button>
            </div>

            {/* =========================================================
                TAB 1: RINGKASAN & LOG PRESENSI REALTIME
               ========================================================= */}
            {activeTab === 'overview' && (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Live Monitoring Presensi Seluruh Karyawan</h2>
                            <p className="text-xs text-gray-500">Log sinkronisasi kehadiran otomatis dari database MySQL</p>
                        </div>
                        <span className="text-xs text-gray-500">Total Log: <strong>{attendanceList.length}</strong> catatan</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                                    <th className="py-3 px-3">Karyawan</th>
                                    <th className="py-3 px-3">Tanggal</th>
                                    <th className="py-3 px-3">Jam Masuk</th>
                                    <th className="py-3 px-3">Jam Keluar</th>
                                    <th className="py-3 px-3">Durasi</th>
                                    <th className="py-3 px-3">Status</th>
                                    <th className="py-3 px-3">Lokasi / Catatan</th>
                                    <th className="py-3 px-3 text-right print:hidden">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {attendanceList.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="py-3 px-3">
                                            <div className="flex items-center gap-2.5">
                                                <img src={row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={row.nama} className="w-7 h-7 rounded-full object-cover shrink-0" />
                                                <div>
                                                    <div className="font-bold text-gray-900">{row.nama}</div>
                                                    <div className="text-[11px] text-gray-400">{row.posisi}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 whitespace-nowrap font-medium">
                                            {row.tanggal ? row.tanggal.substring(0, 10) : '-'}
                                        </td>
                                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                                            {row.jam_masuk ? row.jam_masuk.substring(0, 5) : '-'}
                                        </td>
                                        <td className="py-3 px-3 font-mono">
                                            {row.jam_pulang ? row.jam_pulang.substring(0, 5) : '--:--'}
                                        </td>
                                        <td className="py-3 px-3 font-mono font-medium">
                                            {row.durasi_kerja || '-'}
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                                row.status === 'Terlambat'
                                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                            }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-gray-500">
                                            <div className="truncate max-w-[180px]">{row.lokasi_masuk}</div>
                                            {row.catatan && <div className="text-[10px] text-gray-400 truncate max-w-[180px]">{row.catatan}</div>}
                                        </td>
                                        <td className="py-3 px-3 text-right print:hidden">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAttendance(row.id)}
                                                title="Hapus Catatan"
                                                className="w-7 h-7 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 inline-flex items-center justify-center transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* =========================================================
                TAB 2: DATA KARYAWAN (CRUD LENGKAP)
               ========================================================= */}
            {activeTab === 'employees' && (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Manajemen Data Karyawan (CRUD)</h2>
                            <p className="text-xs text-gray-500">Tersimpan langsung pada tabel karyawan di database MySQL</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleOpenAddModal}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#34c759] hover:bg-[#006e28] text-white text-xs font-bold shadow-md transition-all print:hidden"
                        >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                            <span>Tambah Karyawan Baru</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                                    <th className="py-3 px-3">ID</th>
                                    <th className="py-3 px-3">Karyawan</th>
                                    <th className="py-3 px-3">Email</th>
                                    <th className="py-3 px-3">Posisi</th>
                                    <th className="py-3 px-3">Role Hak Akses</th>
                                    <th className="py-3 px-3 text-right print:hidden">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {karyawanList.map(k => (
                                    <tr key={k.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="py-3 px-3 font-mono font-bold text-gray-400">#{k.id}</td>
                                        <td className="py-3 px-3">
                                            <div className="flex items-center gap-2.5">
                                                <img src={k.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={k.nama} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                                <span className="font-bold text-gray-900">{k.nama}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-gray-600 font-mono">{k.email}</td>
                                        <td className="py-3 px-3 font-medium">{k.posisi}</td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                                k.role === 'admin'
                                                    ? 'bg-blue-100 text-[#0058bc] border border-blue-200'
                                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                            }`}>
                                                {k.role || 'karyawan'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right whitespace-nowrap print:hidden">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEditModal(k)}
                                                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold mr-1.5 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteEmployee(k.id, k.nama)}
                                                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* =========================================================
                TAB 3: PERSETUJUAN CUTI & IZIN
               ========================================================= */}
            {activeTab === 'leave' && (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Kelola Permohonan Cuti & Izin</h2>
                            <p className="text-xs text-gray-500">Persetujuan langsung oleh Tim HR / Management</p>
                        </div>
                        <span className="text-xs text-gray-500">Total Pengajuan: <strong>{leaveList.length}</strong></span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                                    <th className="py-3 px-3">Karyawan</th>
                                    <th className="py-3 px-3">Jenis Izin</th>
                                    <th className="py-3 px-3">Rentang Tanggal</th>
                                    <th className="py-3 px-3">Alasan / Catatan</th>
                                    <th className="py-3 px-3">Status</th>
                                    <th className="py-3 px-3 text-right print:hidden">Tindakan HR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {leaveList.map(l => (
                                    <tr key={l.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="py-3 px-3">
                                            <div className="font-bold text-gray-900">{l.nama || `Karyawan #${l.karyawan_id}`}</div>
                                            <div className="text-[11px] text-gray-400">{l.posisi || l.email}</div>
                                        </td>
                                        <td className="py-3 px-3 font-semibold text-gray-800">
                                            {l.tipe || 'Cuti Tahunan'}
                                        </td>
                                        <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                                            {l.tanggal_mulai?.substring(0, 10)} s/d {l.tanggal_selesai?.substring(0, 10)}
                                        </td>
                                        <td className="py-3 px-3 text-gray-600 max-w-[220px]">
                                            {l.alasan || '-'}
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                                l.status === 'Disetujui'
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                    : l.status === 'Ditolak'
                                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                            }`}>
                                                {l.status || 'Menunggu'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right whitespace-nowrap print:hidden">
                                            {l.status === 'Menunggu' ? (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateLeaveStatus(l.id, 'Disetujui')}
                                                        className="px-3 py-1 rounded-lg bg-[#34c759] hover:bg-[#006e28] text-white font-bold transition-all shadow-sm"
                                                    >
                                                        Setujui
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateLeaveStatus(l.id, 'Ditolak')}
                                                        className="px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold transition-all"
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-[11px]">Telah diproses</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* =========================================================
                MODAL FORM TAMBAH / EDIT KARYAWAN
               ========================================================= */}
            {showEmployeeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:hidden">
                    <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowEmployeeModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveEmployee} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Sarah Amanda"
                                    value={employeeForm.nama}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, nama: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#34c759] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Email Perusahaan</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="sarah.amanda@hadirku.id"
                                    value={employeeForm.email}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#34c759] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Kata Sandi {editingEmployee && <span className="font-normal text-gray-400">(Opsional / Reset)</span>}
                                </label>
                                <input
                                    type="password"
                                    placeholder={editingEmployee ? 'Kosongkan jika tidak ingin mengubah kata sandi' : 'Default: 123456 (bila dikosongkan)'}
                                    value={employeeForm.password}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#34c759] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Posisi / Jabatan</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: UI/UX Designer"
                                    value={employeeForm.posisi}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, posisi: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#34c759] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Role Akses</label>
                                <select
                                    value={employeeForm.role}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#34c759] outline-none"
                                >
                                    <option value="karyawan">Karyawan (Portal Biasa)</option>
                                    <option value="admin">Admin / HR (Manajemen Tim)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">URL Avatar Foto</label>
                                <input
                                    type="text"
                                    placeholder="https://images.unsplash.com/..."
                                    value={employeeForm.avatar}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, avatar: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#34c759] outline-none"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEmployeeModal(false)}
                                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#34c759] hover:bg-[#006e28] text-white font-bold text-xs shadow-md"
                                >
                                    Simpan Karyawan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
