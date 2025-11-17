'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "./navbar/Navbar";

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const expires = localStorage.getItem('tokenExpiry');

        if (!token || !expires || Date.now() > Number(expires)) {
            localStorage.removeItem('token');
            localStorage.removeItem('tokenExpiry');
            router.push('/LoginPage');
        }
    }, [router]);

    const links = [
        { href: "/objects", title: "Об’єкти", desc: "Перегляд усіх об’єктів та робіт" },
        { href: "/import", title: "Імпорт файлів", desc: "Завантаження Excel з роботами" },
        { href: "/reports", title: "Звіти", desc: "Генерація Excel / PDF" },
        { href: "/users", title: "Користувачі", desc: "Управління адмiнами та менеджерами" },
        { href: "/settings", title: "Налаштування", desc: "Конфігурації системи" },
        { href: "/PhotoReport", title: "Фото-звіти", desc: "Перегляд фото по об’єктах" }, // <-- новий блок
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 text-black">
            <Navbar />

            <div className="px-8 py-12 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-red-700 drop-shadow-sm">
                        AGRICON Admin Panel
                    </h1>
                    <p className="mt-3 text-gray-700 text-lg font-medium">
                        Керуйте об’єктами, роботами, імпортами та звітністю з однієї панелі
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.href}
                            className="group block p-8 rounded-3xl shadow-xl border border-red-200
                                       bg-white hover:bg-red-600 transition duration-300
                                       hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
                        >
                            {/* Decorative background circle */}
                            <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-red-200 opacity-20 group-hover:bg-red-400 group-hover:opacity-30 transition"></div>

                            {/* Title */}
                            <h2 className="text-3xl font-bold mb-3 text-red-700 group-hover:text-white transition">
                                {link.title}
                            </h2>

                            {/* Description */}
                            <p className="text-gray-600 group-hover:text-red-50 transition font-medium mb-6">
                                {link.desc}
                            </p>

                            {/* Footer */}
                            <span className="text-red-700 group-hover:text-white text-sm font-semibold transition">
                                Перейти →
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
