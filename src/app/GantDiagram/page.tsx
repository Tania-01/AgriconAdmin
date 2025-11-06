'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import FrappeGanttWrapper from './gantWraper';

interface IWork {
    _id: string;
    name: string;
    volume: number;
    done: number;
    start: string;
    end: string;
}

export default function GanttAdmin() {
    const [works, setWorks] = useState<IWork[]>([]);
    const [loading, setLoading] = useState(true);

    const token =
        typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const fetchWorks = async () => {
            try {
                const res = await axios.get(
                    "https://agricon-backend-1.onrender.com/works/full-data",
                    { headers }
                );

                const formatted = res.data.map((item: any) => ({
                    _id: item._id,
                    name: item.name,
                    volume: item.volume,
                    done: item.done,
                    start: item.start || "",
                    end: item.end || "",
                }));

                setWorks(formatted);
            } catch (err) {
                console.log("❌ Помилка:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWorks();
    }, []);

    const getProgress = (done: number, volume: number) => {
        if (!volume) return 0;
        return Math.min(Math.round((done / volume) * 100), 100);
    };

    const getDuration = (start?: string, end?: string) => {
        if (!start || !end) return "";
        const diff = new Date(end).getTime() - new Date(start).getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
        return days > 0 ? `${days} днів` : "";
    };

    const handleDateChange = async (id: string, field: 'start' | 'end', value: string) => {
        const updated = works.map(w =>
            w._id === id ? { ...w, [field]: value } : w
        );
        setWorks(updated);

        try {
            await axios.put(
                "https://agricon-backend-1.onrender.com/works/update-dates",
                {
                    workId: id,
                    start: updated.find(w => w._id === id)?.start,
                    end: updated.find(w => w._id === id)?.end,
                },
                { headers }
            );
        } catch (err) {
            console.error("❌ Помилка оновлення дат:", err);
        }
    };

    if (loading) return <p className="p-6">Завантаження...</p>;

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
                Діаграма виконання робіт
            </h2>

            {/* -------- 💠 ТАБЛИЦЯ -------- */}
            <table className="w-full border text-sm mb-8">
                <thead className="bg-gray-100">
                <tr>
                    <th className="border p-2 text-left">Назва роботи</th>
                    <th className="border p-2">Обсяг</th>
                    <th className="border p-2">Виконано</th>
                    <th className="border p-2">Початок</th>
                    <th className="border p-2">Завершення</th>
                    <th className="border p-2">Тривалість</th>
                    <th className="border p-2">Прогрес (%)</th>
                </tr>
                </thead>

                <tbody>
                {works.map(work => (
                    <tr key={work._id}>
                        <td className="border p-2">{work.name}</td>
                        <td className="border p-2 text-center">{work.volume}</td>
                        <td className="border p-2 text-center">{work.done}</td>

                        {/* DATE START */}
                        <td className="border p-2">
                            <input
                                type="date"
                                value={work.start || ""}
                                onChange={e =>
                                    handleDateChange(work._id, "start", e.target.value)
                                }
                                className="border px-2 py-1 w-full"
                            />
                        </td>

                        {/* DATE END */}
                        <td className="border p-2">
                            <input
                                type="date"
                                value={work.end || ""}
                                onChange={e =>
                                    handleDateChange(work._id, "end", e.target.value)
                                }
                                className="border px-2 py-1 w-full"
                            />
                        </td>

                        <td className="border p-2 text-center">
                            {getDuration(work.start, work.end)}
                        </td>

                        <td className="border p-2 text-center">
                            {getProgress(work.done, work.volume)}%
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* -------- 💠 GANTT CHART -------- */}
            <div className="border rounded-lg p-4 shadow-md bg-white">
                <FrappeGanttWrapper
                    tasks={works
                        .filter(w => w.start && w.end)
                        .map(w => ({
                            id: w._id,
                            name: w.name,
                            start: w.start,
                            end: w.end,
                            progress: getProgress(w.done, w.volume),
                        }))}
                    viewMode="Day"
                />
            </div>
        </div>
    );
}
