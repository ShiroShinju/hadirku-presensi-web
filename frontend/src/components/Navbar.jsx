import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ currentUser, onLogout, lang, setLang }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const location = useLocation();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTimeWIB = (date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const formatDateWIB = (date) => {
        return date.toLocaleDateString(lang === 'ID' ? 'id-ID' : 'en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300 px-4 md:px-8 py-3 bg-[#fcf8fb]/85 backdrop-blur-xl border-b border-gray-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Brand Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#34c759] flex items-center justify-center shadow-[0_4px_12px_rgba(52,199,89,0.35)]">
                        <span className="material-symbols-outlined text-white text-[22px]">fingerprint</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight text-[#1b1b1d] leading-none">
                            Hadir<span className="text-[#006e28]">Ku</span>
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">
                            {currentUser?.role === 'admin' ? 'HR & Admin Console' : 'Attendance Portal'}
                        </span>
                    </div>
                </div>

                {/* Center / Navigation links if logged in */}
                {currentUser && (
                    <nav className="hidden md:flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-full text-xs font-semibold">
                        <Link
                            to="/dashboard"
                            className={`px-4 py-1.5 rounded-full transition-all ${
                                location.pathname === '/dashboard'
                                    ? 'bg-white text-[#1b1b1d] shadow-sm'
                                    : 'text-gray-600 hover:text-black'
                            }`}
                        >
                            {currentUser.role === 'admin' ? 'Presensi Pribadi' : 'Dashboard Presensi'}
                        </Link>
                        {currentUser.role === 'admin' && (
                            <Link
                                to="/admin"
                                className={`px-4 py-1.5 rounded-full transition-all ${
                                    location.pathname === '/admin'
                                        ? 'bg-white text-[#1b1b1d] shadow-sm'
                                        : 'text-gray-600 hover:text-black'
                                }`}
                            >
                                Konsol Admin HR
                            </Link>
                        )}
                    </nav>
                )}

                {/* Right Area: Time, Lang, Profile & Actions */}
                <div className="flex items-center gap-3">
                    {/* Live Digital Clock Badge */}
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100/90 text-gray-700 text-xs font-semibold shadow-inner">
                        <span className="material-symbols-outlined text-[15px] text-[#006e28]">schedule</span>
                        <span>{formatDateWIB(currentTime)} • {formatTimeWIB(currentTime)} WIB</span>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-center p-0.5 rounded-full bg-gray-200/70 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setLang('ID')}
                            className={`px-2 py-0.5 rounded-full transition-all ${
                                lang === 'ID'
                                    ? 'bg-white text-[#006e28] shadow-sm'
                                    : 'text-gray-600 hover:text-black'
                            }`}
                        >
                            ID
                        </button>
                        <span className="text-gray-400 text-[10px]">|</span>
                        <button
                            type="button"
                            onClick={() => setLang('EN')}
                            className={`px-2 py-0.5 rounded-full transition-all ${
                                lang === 'EN'
                                    ? 'bg-white text-[#006e28] shadow-sm'
                                    : 'text-gray-600 hover:text-black'
                            }`}
                        >
                            EN
                        </button>
                    </div>

                    {/* User Profile Pill or Login Button */}
                    {currentUser ? (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/90 border border-gray-200 shadow-sm">
                                <img
                                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                    alt={currentUser.nama}
                                    className="w-7 h-7 rounded-full object-cover ring-2 ring-[#34c759]"
                                />
                                <div className="hidden lg:flex flex-col text-left">
                                    <span className="text-xs font-bold text-gray-900 leading-tight">
                                        {currentUser.nama}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-medium leading-tight">
                                        {currentUser.posisi}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onLogout}
                                title="Keluar / Ganti Akun"
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/"
                            className="px-4 py-1.5 rounded-full bg-[#34c759] hover:bg-[#006e28] text-white text-xs font-bold shadow-md transition-all"
                        >
                            Masuk Portal
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
