'use client';

import ImportPage from './ImportForm';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from '../navbar/Navbar';

export default function ImportExcelPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("token");
            if (!storedToken) {
                router.push("/"); // редірект на головну, якщо користувач не увійшов
            } else {
                setToken(storedToken);
            }
        }
    }, [router]);

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat p-6"
            style={{ backgroundImage: "url('/3.jpg')" }} // твій бекграунд
        >
            {/* Navbar зверху */}
            <Navbar />

            {/* Центрований блок з формою */}
            <div className="flex flex-col items-center justify-start pt-20">
                <div className="bg-white/80 backdrop-blur-md p-20 rounded-3xl shadow-2xl border border-gray-200 max-w-6xl w-full min-h-[650px]">

                    <h1 className="text-5xl font-extrabold text-red-600 mb-8 text-center">
                        Імпорт робіт з Excel
                    </h1>

                    <p className="text-gray-700 mb-12 text-center text-lg">
                        Завантажте ваш Excel файл, щоб автоматично додати роботи у систему.
                        Підтримуються формати <span className="font-semibold">.xlsx</span> і <span className="font-semibold">.xls</span>.
                    </p>

                    {/* Форма */}
                    {token ? <ImportPage /> : <p className="text-center text-gray-500">Завантаження...</p>}
                </div>
            </div>
        </div>
    );
}
