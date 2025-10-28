'use client';

import Link from "next/link";
import Navbar from "./navbar/Navbar";

export default function HomePage() {
    const links = [
        { href: "/objects", title: "Об’єкти", desc: "Перегляд усіх об’єктів і робіт" },
        { href: "/import", title: "Імпорт файлів", desc: "Завантаження Excel з роботами" },
        { href: "/reports", title: "Звіти", desc: "Генерація звітів Excel/PDF" },
    ];

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
