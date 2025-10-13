'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Work {
    _id: string;
    object: string;
    name: string;
    unit: string;
    volume: number;
    done: number;
}

export default function ReportsPage() {
    const [objects, setObjects] = useState<string[]>([]);
    const [selectedObject, setSelectedObject] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchObjects = async () => {
            try {
                const res = await axios.get<Work[]>(
                    "https://agricon-backend-1.onrender.com/works/full-data"
                );
                const objs = Array.from(new Set(res.data.map((w) => w.object)));
                setObjects(objs);
            } catch (err) {
                console.error(err);
            }
        };
        fetchObjects();
    }, []);

    const sanitizeObjectName = (name: string) => {
        // Замінюємо всі заборонені символи на "_"
        return name.replace(/[*?:\\/\[\]]/g, "_");
    };

    const handleDownload = async () => {
        if (!selectedObject) {
            setMessage("Будь ласка, оберіть об’єкт");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            // Відправляємо на бек назву об’єкта у "сирому" вигляді
            const res = await axios.post(
                "https://agricon-backend-1.onrender.com/works/report",
                { object: selectedObject },
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            const safeName = sanitizeObjectName(selectedObject); // замінюємо символи для файлу
            link.href = url;
            link.setAttribute(
                "download",
                `${safeName}_report_all.xlsx`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: any) {
            console.error(err);
            setMessage(err.response?.data?.message || "Помилка при завантаженні");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black">
            <nav className="bg-red-600 text-white py-4 px-8 shadow-md">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Адмінка</h1>
                    <div className="space-x-6">
                        <Link href="/" className="hover:underline">Головна</Link>
                        <Link href="/objects" className="hover:underline">Об’єкти</Link>
                        <Link href="/reports" className="hover:underline">Звіти</Link>
                    </div>
                </div>
            </nav>

            <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6 text-red-600">Генерація звітів</h1>

                <div className="mb-6">
                    <label className="block mb-2 text-red-600 font-semibold">Оберіть об’єкт:</label>
                    <select
                        value={selectedObject}
                        onChange={(e) => setSelectedObject(e.target.value)}
                        className="w-full p-3 rounded border-2 border-red-600 bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="">-- Оберіть --</option>
                        {objects.map((obj, i) => (
                            <option key={i} value={obj}>
                                {obj}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition flex justify-center items-center"
                >
                    {loading ? "Завантаження..." : "Завантажити звіт"}
                </button>

                {message && <p className="mt-4 text-red-600">{message}</p>}
            </div>
        </div>
    );
}
