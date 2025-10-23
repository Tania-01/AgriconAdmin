'use client';

import { useState } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import Navbar from '../navbar/Navbar';

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [city, setCity] = useState('');
    const [object, setObject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [hasSubname, setHasSubname] = useState(false); // новий стан для чекбокса

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setMessage('');
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            setFile(droppedFile);
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Будь ласка, виберіть файл');
            return;
        }
        if (!city || !object) {
            setMessage("Будь ласка, введіть 'Місто' та 'Об’єкт'");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('city', city);
        formData.append('object', object);
        formData.append('hasSubname', hasSubname.toString()); // передаємо прапорець на бекенд

        setLoading(true);
        try {
            const res = await axios.post(
                'https://agricon-backend-1.onrender.com/works/import',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            setMessage(res.data.message);
            setFile(null);
            setCity('');
            setObject('');
            setHasSubname(false);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Помилка при завантаженні');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="p-6 max-w-lg mx-auto bg-white text-black rounded-xl shadow-lg border border-red-300 mt-10">
                <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
                    Імпорт робіт з Excel
                </h1>

                <div className="space-y-3 mb-4">
                    <input
                        type="text"
                        placeholder="Місто"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full border border-red-400 focus:ring-2 focus:ring-red-500 px-3 py-2 rounded outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Об’єкт"
                        value={object}
                        onChange={(e) => setObject(e.target.value)}
                        className="w-full border border-red-400 focus:ring-2 focus:ring-red-500 px-3 py-2 rounded outline-none"
                    />
                </div>

                {/* Чекбокс для subname */}
                <div className="mb-4 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="hasSubname"
                        checked={hasSubname}
                        onChange={() => setHasSubname(prev => !prev)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="hasSubname" className="text-red-700 font-medium">
                        Перший рядок після заголовку – підназва
                    </label>
                </div>

                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full h-32 border-2 rounded-md flex items-center justify-center text-sm cursor-pointer transition-colors
                    ${dragActive ? 'border-red-600 bg-red-50' : 'border-red-400 hover:bg-red-50'}
                    `}
                >
                    <label htmlFor="file-upload" className="text-red-700 font-medium cursor-pointer text-center">
                        Перетягніть файл сюди або натисніть для вибору
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {file && (
                    <p className="text-sm text-gray-700 italic mt-2">
                        Вибраний файл: <strong className="text-red-600">{file.name}</strong>
                    </p>
                )}

                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="w-full flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded mt-4 hover:bg-red-700 font-semibold transition disabled:opacity-60"
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin mr-2" />
                            Завантаження...
                        </>
                    ) : (
                        'Завантажити'
                    )}
                </button>

                {message && (
                    <p className="mt-4 text-center text-sm text-red-700 border-t border-red-200 pt-4">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
