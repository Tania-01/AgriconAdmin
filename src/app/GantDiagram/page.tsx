'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import FrappeGanttWrapper from './gantWraper'; // імпорт обгортки

interface IWork {
    _id: string;
    name: string;
    volume: number;
    done: number;
    start?: string;
    end?: string;
}

interface Task {
    id: string;
    name: string;
    start: string;
    end: string;
    progress?: number;
}

export default function GanttChart() {
    const [works, setWorks] = useState<IWork[]>([]);

    useEffect(() => {
        axios.get('https://agricon-backend-1.onrender.com/works/full-datas')
            .then(res => {
                const formatted: IWork[] = res.data.map((item: any) => ({
                    _id: item._id,
                    name: item.name,
                    volume: item.volume,
                    done: item.done,
                    start: '',
                    end: '',
                }));
                setWorks(formatted);
            });
    }, []);

    const getProgress = (done: number, volume: number) => {
        if (!volume) return 0;
        return Math.min(Math.round((done / volume) * 100), 100);
    };

    const getDuration = (start?: string, end?: string) => {
        if (!start || !end) return '';
        const diffTime = new Date(end).getTime() - new Date(start).getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return days > 0 ? `${days} дн.` : '';
    };

    const handleDateChange = (id: string, field: 'start' | 'end', value: string) => {
        setWorks(prev => prev.map(w => w._id === id ? { ...w, [field]: value } : w));
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Діаграма виконання робіт</h2>

            {/* Таблиця */}
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
                        <td className="border p-2">
                            <input
                                type="date"
                                value={work.start || ''}
                                onChange={e => handleDateChange(work._id, 'start', e.target.value)}
                                className="border px-2 py-1 w-full"
                            />
                        </td>
                        <td className="border p-2">
                            <input
                                type="date"
                                value={work.end || ''}
                                onChange={e => handleDateChange(work._id, 'end', e.target.value)}
                                className="border px-2 py-1 w-full"
                            />
                        </td>
                        <td className="border p-2 text-center">{getDuration(work.start, work.end)}</td>
                        <td className="border p-2 text-center">{getProgress(work.done, work.volume)}%</td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* FrappeGantt */}
            {works.some(w => w.start && w.end) && (
                <div className="border rounded-lg p-4 shadow-md bg-white">
                    <FrappeGanttWrapper
                        tasks={works.filter(w => w.start && w.end).map(w => ({
                            id: w._id,
                            name: w.name,
                            start: w.start!,
                            end: w.end!,
                            progress: getProgress(w.done, w.volume),
                        }))}
                        viewMode="Day"
                    />
                </div>
            )}
        </div>
    );
}
