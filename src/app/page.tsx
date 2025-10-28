'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "./navbar/Navbar";

export default function HomePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Перевіряємо токен при завантаженні
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://agricon-backend-1.onrender.com/works/sign-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Помилка входу');

            if (data.user.role !== 'admin') {
                setError('Доступ заборонено. Лише для адмінів.');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', data.token);
            setIsLoggedIn(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const links = [
        { href: "/objects", title: "Об’єкти", desc: "Перегляд усіх об’єктів і робіт" },
        { href: "/import", title: "Імпорт файлів", desc: "Завантаження Excel з роботами" },
        { href: "/reports", title: "Звіти", desc: "Генерація звітів Excel/PDF" },
    ];

    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 bg-white shadow-md rounded-md">
                    <h2 className="text-2xl font-bold mb-6 text-center">Адмін Вхід</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <label className="block mb-1 font-medium">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Пароль</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                        >
                            {loading ? 'Завантаження...' : 'Увійти'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="p-8 max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-6 text-red-600">Адмінка робіт</h1>
                <p className="mb-8 text-gray-700">Оберіть розділ для роботи:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.href}
                            className="block p-6 rounded-2xl shadow-md border-2 border-red-600
                         bg-white text-red-600 hover:bg-red-600 hover:text-white
                         transition flex flex-col justify-between h-40"
                        >
                            <div>
                                <h2 className="text-2xl font-semibold mb-2">{link.title}</h2>
                                <p className="text-gray-600">{link.desc}</p>
                            </div>
                            <span className="text-right text-sm font-medium">Перейти →</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
