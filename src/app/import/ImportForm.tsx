'use client';

import { useState } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

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

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3002/work/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(res.data.message);
            setFile(null);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Помилка при завантаженні');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white dark:bg-black rounded-xl shadow-md space-y-6 transition-colors">
            <h1 className="text-2xl font-bold text-black dark:text-white">Імпорт робіт з Excel</h1>

            {/* Dropzone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full h-32 border-2 rounded flex items-center justify-center text-sm cursor-pointer transition-colors
        ${dragActive ? 'border-black dark:border-white bg-gray-100 dark:bg-gray-800' : 'border-gray-400 dark:border-gray-600'}
        `}
            >
                <label htmlFor="file-upload" className="text-black dark:text-white cursor-pointer text-center">
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

            {/* Preview filename */}
            {file && (
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    Вибраний файл: <strong>{file.name}</strong>
                </p>
            )}

            {/* Upload button */}
            <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full flex items-center justify-center bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-300 font-semibold transition-colors disabled:opacity-60"
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

            {/* Message */}
            {message && (
                <p className="mt-4 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700 pt-4">
                    {message}
                </p>
            )}
        </div>
    );
}
