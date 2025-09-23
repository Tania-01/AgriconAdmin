"use client";

import Link from "next/link";

export default function HomePage() {
    const links = [
        { href: "/objects", title: "Об’єкти", desc: "Перегляд усіх об’єктів і робіт" },
        { href: "/import", title: "Імпорт файлів", desc: "Завантаження Excel з роботами" },
        { href: "/users", title: "Користувачі", desc: "Створення нового користувача" },
    ];

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Адмінка робіт</h1>
            <p className="mb-8 text-gray-600">Оберіть розділ для роботи:</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {links.map((link, i) => (
                    <Link
                        key={i}
                        href={link.href}
                        className="block p-6 rounded-2xl shadow-md border hover:shadow-lg hover:bg-gray-50 transition"
                    >
                        <h2 className="text-xl font-semibold mb-2">{link.title}</h2>
                        <p className="text-gray-500">{link.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
