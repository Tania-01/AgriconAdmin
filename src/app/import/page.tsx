'use client';

import ImportPage from './ImportForm';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportExcelPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("token");
            if (!storedToken) {
                // редірект на головну, якщо користувач не увійшов
                router.push("/");
            } else {
                setToken(storedToken);
            }
        }
    }, [router]);

    return (
        <div>
            <h1 className="text-3xl font-bold">Імпорт робіт з Excel</h1>
            {token && <ImportPage />}
        </div>
    );
}
