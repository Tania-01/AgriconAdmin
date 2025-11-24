'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "../navbar/Navbar";

interface PhotoReport {
    _id: string;
    note?: string;
    signedUrl: string;
    createdBy?: { name?: string; email?: string } | null;
}

interface Work {
    object: string;
}

export default function PhotoReportsPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [objects, setObjects] = useState<string[]>([]);
    const [selectedObject, setSelectedObject] = useState("");
    const [photos, setPhotos] = useState<PhotoReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Отримуємо токен
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) router.push("/LoginPage");
        else setToken(storedToken);
    }, [router]);

    // Завантажуємо об’єкти
    useEffect(() => {
        if (!token) return;
        const fetchObjects = async () => {
            try {
                const res = await axios.get<Work[]>(
                    "https://agricon-backend-1.onrender.com/works/full-data",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const objs = Array.from(new Set(res.data.map(w => w.object))).filter(Boolean);
                setObjects(objs);
            } catch (err: any) {
                console.error(err);
                setMessage(err.response?.data?.message || "Помилка при завантаженні об’єктів");
            }
        };
        fetchObjects();
    }, [token]);

    const handleObjectChange = async (objectName: string) => {
        setSelectedObject(objectName);
        if (!objectName) {
            setPhotos([]);
            return;
        }

        setLoading(true);
        setMessage("");
        try {
            const res = await axios.get<PhotoReport[]>(
                `https://agricon-backend-1.onrender.com/works/files/${encodeURIComponent(objectName)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPhotos(res.data);
        } catch (err: any) {
            console.error(err);
            setMessage(err.response?.data?.message || "Помилка при завантаженні фото");
            setPhotos([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-5xl mx-auto mt-12 p-6 bg-white rounded-3xl shadow-lg">
                <h1 className="text-3xl font-bold mb-6 text-center text-red-700">
                    Фото-звіти по об’єктах
                </h1>

                <div className="mb-6">
                    <label className="block mb-2 font-semibold">Об’єкт</label>
                    <select
                        value={selectedObject}
                        onChange={(e) => handleObjectChange(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-400"
                    >
                        <option value="">-- Оберіть об’єкт --</option>
                        {objects.map(obj => <option key={obj} value={obj}>{obj}</option>)}
                    </select>
                </div>

                {loading && <p className="text-center text-gray-500">Завантаження...</p>}
                {message && <p className="text-center text-red-600">{message}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {photos.map(photo => (
                        <div key={photo._id} className="border rounded-lg p-2 shadow-sm bg-gray-50">
                            <a
                                href={photo.signedUrl}
                                className="w-full h-48 object-cover rounded-md mb-2"
                            ><img src={photo.signedUrl}
                                  className="w-full h-48 object-cover rounded-md mb-2"
                            /></a>

                            {photo.note && <p className="text-sm text-gray-700">{photo.note}</p>}
                            <p className="text-xs text-gray-500">
                                Завантажив: {photo.createdBy?.name || "Невідомо"} ({photo.createdBy?.email || "—"})
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
