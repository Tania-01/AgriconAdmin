'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../navbar/Navbar";

interface Photo {
    _id: string;
    imageUrl: string;
    note?: string;
    object?: string;
    createdAt?: string;
}

interface ObjectItem {
    _id: string;
    name: string;
}

export default function PhotoReportPage() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [objects, setObjects] = useState<ObjectItem[]>([]);
    const [selectedObject, setSelectedObject] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const API = "https://agricon-backend-1.onrender.com/works";

    // ============================
    //  AUTH HEADERS
    // ============================
    const getAuthHeaders = () => {
        try {
            const token = localStorage.getItem("token");
            return token ? { Authorization: `Bearer ${token}` } : {};
        } catch {
            return {};
        }
    };

    // ============================
    //  FETCH OBJECTS
    // ============================
    const fetchObjects = async () => {
        try {
            const res = await axios.get(`${API}/full-datas`, {
                headers: getAuthHeaders()
            });

            const objectNames = res.data
                .map((w: any) => w.object)
                .filter(Boolean);

            const uniqueObjects: ObjectItem[] = Array.from(new Set(objectNames)).map(
                (obj) => ({
                    _id: String(obj),
                    name: String(obj),
                })
            );

            setObjects(uniqueObjects);
        } catch (err) {
            console.error("Помилка при отриманні об’єктів:", err);
            setMessage("Помилка при отриманні об’єктів");
        }
    };

    // ============================
    //  FETCH PHOTOS BY OBJECT
    // ============================
    const fetchPhotos = async (objectName: string) => {
        if (!objectName) {
            setPhotos([]);
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await axios.get(
                `${API}/photo/${encodeURIComponent(objectName)}`,
                { headers: getAuthHeaders() }
            );

            const list = res.data?.data ?? res.data ?? [];
            setPhotos(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Помилка при отриманні фото:", err);
            setMessage("Помилка при отриманні фото");
            setPhotos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchObjects();
    }, []);

    useEffect(() => {
        fetchPhotos(selectedObject);
    }, [selectedObject]);

    // ============================
    //  RENDER
    // ============================
    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/3.jpg')" }}
        >
            <Navbar />

            <div className="max-w-5xl mx-auto mt-16 p-6">
                <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-8">

                    <h1 className="text-4xl font-extrabold mb-8 text-red-600 text-center">
                        Фото-звіти
                    </h1>

                    {/* ВИБІР ОБ’ЄКТА */}
                    <div className="mb-6">
                        <label className="block mb-2 font-semibold text-gray-700">
                            Об’єкт
                        </label>

                        <select
                            value={selectedObject}
                            onChange={(e) => setSelectedObject(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300
                                       focus:ring-2 focus:ring-red-400 focus:outline-none transition"
                        >
                            <option value="">-- Оберіть --</option>

                            {objects.map((obj) => (
                                <option key={obj._id} value={obj.name}>
                                    {obj.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* СТАТУСИ / ПОВІДОМЛЕННЯ */}
                    {loading && <p className="text-center mb-4">Завантаження...</p>}

                    {!loading && message && (
                        <p className="text-center text-red-600 mb-4">{message}</p>
                    )}

                    {!loading && !selectedObject && (
                        <p className="text-center mb-4">Будь ласка, оберіть об’єкт</p>
                    )}

                    {!loading && selectedObject && photos.length === 0 && (
                        <p className="text-center mb-4">Немає фото для цього об’єкта</p>
                    )}

                    {/* ГАЛЕРЕЯ */}
                    {!loading && photos.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {photos.map((p) => (
                                <div
                                    key={p._id}
                                    className="border border-gray-300 rounded-2xl p-2
                                               bg-white/70 shadow-md"
                                >
                                    <img
                                        src={p.imageUrl}
                                        alt={p.note || "Фото"}
                                        className="w-full h-48 object-cover rounded-xl mb-2"
                                    />

                                    {p.note && (
                                        <p className="text-gray-700 text-sm mb-1">{p.note}</p>
                                    )}

                                    {p.object && (
                                        <p className="text-gray-600 text-xs">
                                            <b>Об’єкт:</b> {p.object}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
