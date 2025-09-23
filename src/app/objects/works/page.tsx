'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

interface IWork {
    name: string;
    unit: string;
    volume: number;
    done: number;
}

export default function WorksPage() {
    const searchParams = useSearchParams();
    const objectName = searchParams.get('object');
    const [works, setWorks] = useState<IWork[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!objectName) return;

        const fetchWorks = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:3002/work/works?object=${encodeURIComponent(objectName)}`);
                setWorks(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchWorks();
    }, [objectName]);

    if (!objectName) return <p>Не обрано об’єкт</p>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Роботи об’єкта: {objectName}</h1>
            {loading && <p>Завантаження...</p>}
            <ul className="space-y-2">
                {works.map((work, index) => (
                    <li key={index} className="border p-2 rounded">
                        {work.name} — {work.volume} {work.unit} (Виконано: {work.done})
                    </li>
                ))}
            </ul>
        </div>
    );
}
