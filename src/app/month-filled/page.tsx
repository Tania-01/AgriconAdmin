'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface FilledEntry {
    object: string;
    user: string;
    date: string;
}

export default function MonthFilledPage() {
    const [data, setData] = useState<FilledEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('https://agricon-backend-1.onrender.com/works/month-filled', { headers });
                setData(res.data);
            } catch (err: any) {
                console.error(err);
                setError('Помилка завантаження даних');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <p className="p-6 text-gray-600">Завантаження...</p>;
    if (error) return <p className="p-6 text-red-600">{error}</p>;

    // Відфільтровуємо дублікати: один працівник на об’єкт в один день
    const uniqueData = Object.values(
        data.reduce((acc: Record<string, FilledEntry>, entry) => {
            const dateStr = new Date(entry.date).toLocaleDateString();
            const key = `${entry.object}_${entry.user}_${dateStr}`; // унікальний ключ
            if (!acc[key]) acc[key] = { ...entry, date: dateStr };
            return acc;
        }, {})
    );

    return (
        <div className="min-h-screen bg-white text-black p-6">
            <h1 className="text-2xl font-bold mb-4">Об’єкти, заповнені за поточний місяць</h1>

            <table className="w-full border border-gray-300">
                <thead className="bg-gray-100">
                <tr>
                    <th className="border px-2 py-1">Об’єкт</th>
                    <th className="border px-2 py-1">Користувач</th>
                    <th className="border px-2 py-1">Дата</th>
                </tr>
                </thead>
                <tbody>
                {uniqueData.map((entry, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border px-2 py-1">{entry.object}</td>
                        <td className="border px-2 py-1">{entry.user}</td>
                        <td className="border px-2 py-1">{entry.date}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
