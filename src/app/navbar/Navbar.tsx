'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
    const pathname = usePathname();

    const links = [
        { href: "/", title: "Головна" },
        { href: "/import", title: "Імпорт" },
        { href: "/reports", title: "Звіти" },
        { href: "/GantDiagram", title: "Діаграма" }
    ];

    return (
        <nav className="bg-red-600 text-white shadow-md">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between h-16 items-center">
                    <div className="text-2xl font-bold">Адмінка</div>
                    <div className="flex space-x-6">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded-md font-medium transition 
                                    ${pathname === link.href
                                    ? 'bg-white text-red-600'
                                    : 'hover:bg-white hover:text-red-600'}`
                                }
                            >
                                {link.title}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
