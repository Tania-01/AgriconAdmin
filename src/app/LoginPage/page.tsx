'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 🔹 Якщо токен ще дійсний — одразу редіректимо на dashboard
    useEffect(() => {
        const token = localStorage.getItem('token');
        const tokenExpiry = localStorage.getItem('tokenExpiry');

        if (token && tokenExpiry && Date.now() < Number(tokenExpiry)) {
            router.push('/');
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('https://agricon-backend-1.onrender.com/works/sign-in', {
                email,
                password,
            });

            const { token, user } = response.data;

            if (user.role !== 'admin' && user.role !== 'manager'){
                setError('Доступ заборонено. Лише для адмінів.');
                setLoading(false);
                return;
            }

            // 🔹 Зберігаємо токен і час його завершення (1 година)
            localStorage.setItem('token', token);
            localStorage.setItem('tokenExpiry', String(Date.now() + 60 * 60 * 1000));

            // 🔹 Редірект на адмін-панель
            router.push('/');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Помилка входу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white shadow-md rounded-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-red-600">Адмін Вхід</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
                    >
                        {loading ? 'Завантаження...' : 'Увійти'}
                    </button>
                </form>
            </div>
        </div>
    );
}
