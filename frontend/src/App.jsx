import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    // Pengguna harus melakukan login terlebih dahulu dengan token yang valid
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = sessionStorage.getItem('hadirku_user');
        const token = sessionStorage.getItem('hadirku_token');
        if (saved && token) {
            try {
                return JSON.parse(saved);
            } catch {
                return null;
            }
        }
        return null;
    });
    const [lang, setLang] = useState('ID');

    const handleLoginSuccess = (user, token) => {
        setCurrentUser(user);
        sessionStorage.setItem('hadirku_user', JSON.stringify(user));
        if (token) {
            sessionStorage.setItem('hadirku_token', token);
        }
        localStorage.removeItem('hadirku_user');
        localStorage.removeItem('hadirku_token');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('hadirku_user');
        sessionStorage.removeItem('hadirku_token');
        localStorage.removeItem('hadirku_user');
        localStorage.removeItem('hadirku_token');
    };

    return (
        <Router>
            <div className="min-h-screen flex flex-col selection:bg-[#34c759] selection:text-white">
                <Navbar
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    lang={lang}
                    setLang={setLang}
                />

                <main className="flex-1">
                    <Routes>
                        {/* Halaman utama (/) selalu menampilkan halaman login jika belum login */}
                        <Route
                            path="/"
                            element={
                                currentUser ? (
                                    currentUser.role === 'admin' ? (
                                        <Navigate to="/admin" replace />
                                    ) : (
                                        <Navigate to="/dashboard" replace />
                                    )
                                ) : (
                                    <LoginPage onLoginSuccess={handleLoginSuccess} lang={lang} />
                                )
                            }
                        />

                        <Route
                            path="/login"
                            element={<LoginPage onLoginSuccess={handleLoginSuccess} lang={lang} />}
                        />

                        <Route
                            path="/dashboard"
                            element={
                                currentUser ? (
                                    <EmployeeDashboard currentUser={currentUser} lang={lang} />
                                ) : (
                                    <Navigate to="/" replace />
                                )
                            }
                        />

                        <Route
                            path="/admin"
                            element={
                                currentUser ? (
                                    currentUser.role === 'admin' ? (
                                        <AdminDashboard currentUser={currentUser} lang={lang} />
                                    ) : (
                                        <Navigate to="/dashboard" replace />
                                    )
                                ) : (
                                    <Navigate to="/" replace />
                                )
                            }
                        />

                        {/* Fallback jika route tidak ditemukan */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
