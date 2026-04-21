'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../navbar/Navbar';

export type ProjectStatus = 'open' | 'closed';

interface Work {
    _id: string;
    city: string;
    object: string;
    category: string;
    name: string;
    unit: string;
    volume: number;
    done: number;
    appName?: string;
    objectStatus: ProjectStatus;
    history: { date: string; amount: number; addedBy: string }[];
    tempDone?: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
}

interface Responsible {
    objectName: string;
    responsibles: User[];
}

export default function ObjectsAndWorksPage() {
    const [works, setWorks] = useState<Work[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [responsibles, setResponsibles] = useState<Responsible[]>([]);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedObject, setSelectedObject] = useState<string | null>(null);
    const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
    const [newWork, setNewWork] = useState({ category: "", name: "", unit: "", volume: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [monthClosed, setMonthClosed] = useState(false);
    const [objectStatus, setObjectStatus] = useState<ProjectStatus>('open');
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const currentMonth = new Date().toISOString().slice(0, 7);
    const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = { Authorization: `Bearer ${getToken()}` };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [worksRes, respRes, usersRes] = await Promise.all([
                    axios.get('https://agricon-backend-1.onrender.com/works/full-data', { headers }),
                    axios.get('https://agricon-backend-1.onrender.com/works/object-responsibles', { headers }),
                    axios.get('https://agricon-backend-1.onrender.com/works/getUser', { headers }),
                ]);
                setWorks(worksRes.data);
                setResponsibles(respRes.data);
                setUsers(usersRes.data);
            } catch (err: any) {
                console.error('Помилка завантаження даних:', err);
                setError('Помилка завантаження даних');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        setSelectedObject(null);
        setShowAddForm(false);
        setSelectedWorkerId('');
    }, [statusFilter, selectedCity]);

    useEffect(() => {
        if (!selectedObject) return;
        axios.get('https://agricon-backend-1.onrender.com/works/month-status', {
            params: { object: selectedObject, month: currentMonth }, headers
        })
            .then(res => setMonthClosed(res.data.closed))
            .catch(() => setMonthClosed(false));
    }, [selectedObject, currentMonth]);

    useEffect(() => {
        if (!selectedObject) return;
        const work = works.find(w => w.object === selectedObject);
        if (work) setObjectStatus(work.objectStatus);
    }, [selectedObject, works]);

    if (loading) return <p className="p-6 text-gray-600">Завантаження...</p>;
    if (error) return <p className="p-6 text-red-600">{error}</p>;

    const cities = Array.from(new Set(works.map(w => w.city)));

    const objects = Array.from(
        new Set(
            works
                .filter(w =>
                    (!selectedCity || w.city === selectedCity) &&
                    (statusFilter === 'all' || w.objectStatus === statusFilter) &&
                    (w.object.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map(w => w.object)
        )
    ).sort();

    const filteredWorks = selectedObject
        ? works.filter(
            w =>
                w.object === selectedObject &&
                (statusFilter === 'all' || w.objectStatus === statusFilter)
        )
        : [];

    const currentResponsibles =
        responsibles.find(r => r.objectName === selectedObject)?.responsibles || [];

    const handleAddNewWork = async () => {
        if (!selectedObject) return;
        try {
            await axios.post(
                'https://agricon-backend-1.onrender.com/works/extraWork',
                { objectName: selectedObject, ...newWork },
                { headers }
            );
            setShowAddForm(false);
            setNewWork({ category: "", name: "", unit: "", volume: "" });
            const res = await axios.get('https://agricon-backend-1.onrender.com/works/full-data', { headers });
            setWorks(res.data);
        } catch (err) {
            console.error('Помилка при додаванні роботи:', err);
        }
    };

    const handleSaveDone = async () => {
        if (!selectedWorkerId) return alert("Оберіть працівника для редагування");

        const updates = filteredWorks
            .filter(w => w.tempDone && Number(w.tempDone) > 0)
            .map(w => ({ id: w._id, doneAmount: Number(w.tempDone) }));

        try {
            await Promise.all(
                updates.map(u =>
                    axios.put(
                        `https://agricon-backend-1.onrender.com/works/works/${u.id}/manager-update`,
                        { doneAmount: u.doneAmount, addedByWorkerId: selectedWorkerId },
                        { headers }
                    )
                )
            );

            setWorks(prev =>
                prev.map(w => {
                    const update = updates.find(u => u.id === w._id);
                    if (update) {
                        return {
                            ...w,
                            done: w.done + update.doneAmount,
                            history: [...w.history, { date: new Date().toISOString(), amount: update.doneAmount, addedBy: selectedWorkerId }],
                            tempDone: ""
                        };
                    }
                    return w;
                })
            );

            alert("Виконане збережено");
        } catch (err) {
            console.error(err);
            alert("Помилка при збереженні виконаного");
        }
    };

    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">Пошук об&apos;єкта:</h2>
                <input
                    type="text"
                    placeholder="Введіть назву об'єкта"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="mb-4 border rounded px-2 py-1 w-64"
                />

                <h2 className="text-xl font-semibold mb-2">Оберіть місто:</h2>
                <select
                    value={selectedCity || ""}
                    onChange={e => { setSelectedCity(e.target.value || null); }}
                    className="mb-4 border rounded px-2 py-1"
                >
                    <option value="">Усі міста</option>
                    {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>

                <div className="flex gap-2 mb-4">
                    {['all', 'open', 'closed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as ProjectStatus | 'all')}
                            className={`px-2 py-1 rounded border text-sm ${statusFilter === status ? 'bg-red-500 text-white border-red-600' : 'bg-white text-red-600 border-red-600 hover:bg-red-50'}`}
                        >
                            {status === 'all' ? 'Усі'  : status === 'open' ? 'Відкритий' : 'Закритий'}
                        </button>
                    ))}
                </div>

                <div className="grid grid-flow-col grid-rows-5 gap-2 mb-4 overflow-x-auto">
                    {objects.map(obj => (
                        <button
                            key={obj}
                            onClick={() => { setSelectedObject(obj); setShowAddForm(false); setSelectedWorkerId(''); }}
                            className={`px-3 py-1 rounded-md border font-medium text-sm transition whitespace-nowrap ${
                                selectedObject === obj
                                    ? 'bg-red-500 text-white border-red-600'
                                    : 'bg-white text-red-600 border-red-600 hover:bg-red-50'
                            }`}
                        >
                            {obj}
                        </button>
                    ))}
                </div>

                {selectedObject && (
                    <div className="border-t border-gray-300 pt-6">

                        <div className="mb-4 flex items-center gap-4">
                            <span className="font-semibold">Статус проєкту:</span>
                            <select
                                value={objectStatus}
                                onChange={async e => {
                                    const newStatus = e.target.value as ProjectStatus;
                                    await axios.put(
                                        `https://agricon-backend-1.onrender.com/works/works/object/status`,
                                        { objectName: selectedObject, status: newStatus },
                                        { headers }
                                    );
                                    setWorks(prev => prev.map(w =>
                                        w.object === selectedObject ? { ...w, objectStatus: newStatus } : w
                                    ));
                                    setObjectStatus(newStatus);
                                }}
                                className="border px-2 py-1 rounded"
                            >
                                <option value="open">Відкритий</option>
                                <option value="closed">Закритий</option>
                            </select>
                            <span>
                                Місяць закрито: {monthClosed ? <span className="text-green-600 font-bold">✔</span> : '—'}
                            </span>
                        </div>

                        <div className="mb-4 flex gap-2 items-center">
                            <span className="font-semibold">Від імені працівника:</span>
                            <select
                                value={selectedWorkerId}
                                onChange={e => setSelectedWorkerId(e.target.value)}
                                className="border border-red-400 px-2 py-1 rounded-md w-64"
                            >
                                <option value="">Оберіть працівника</option>
                                {responsibles.find(r => r.objectName === selectedObject)?.responsibles.map(u => (
                                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>

                        <table className="w-full border border-red-300 shadow-sm text-left">
                            <thead className="bg-red-600 text-white">
                            <tr>
                                <th className="border px-2 py-1">Категорія</th>
                                <th className="border px-2 py-1">Назва роботи</th>
                                <th className="border px-2 py-1">Назва для додатку</th>
                                <th className="border px-2 py-1">Одиниця</th>
                                <th className="border px-2 py-1">Обсяг</th>
                                <th className="border px-2 py-1">Виконано</th>
                                <th className="border px-2 py-1">Додати виконане</th>
                                <th className="border px-2 py-1">Залишок</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredWorks.map((work, i) => {
                                const remaining = (work.volume || 0) - (work.done || 0);
                                const isOverdone = remaining < 0;

                                return (
                                    <tr key={work._id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-red-50'}>
                                        <td className="border px-2 py-1">{work.category}</td>
                                        <td className="border px-2 py-1">{work.name}</td>
                                        <td className="border px-2 py-1">
                                            <input
                                                type="text"
                                                value={work.appName || ""}
                                                onChange={e => setWorks(prev => prev.map(w => w._id === work._id ? { ...w, appName: e.target.value } : w))}
                                                className="border px-1 py-0.5 rounded w-full"
                                            />
                                        </td>
                                        <td className="border px-2 py-1">{work.unit}</td>
                                        <td className="border px-2 py-1">{Number(work.volume).toFixed(2)}</td>
                                        <td className="border px-2 py-1">{Number(work.done).toFixed(2)}</td>
                                        <td className="border px-2 py-1">
                                            <input
                                                type="number"
                                                value={work.tempDone || ""}
                                                onChange={e => setWorks(prev => prev.map(w => w._id === work._id ? { ...w, tempDone: e.target.value } : w))}
                                                className="border px-1 py-0.5 rounded w-20"
                                            />
                                        </td>
                                        <td className={`border px-2 py-1 ${isOverdone ? 'text-red-600 font-bold' : ''}`}>
                                            {isOverdone ? <>🔺 {Math.abs(remaining).toFixed(2)}</> : Number(remaining).toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        <button
                            onClick={handleSaveDone}
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                        >
                            Зберегти виконане
                        </button>

                        <button
                            onClick={() => setShowAddForm(prev => !prev)}
                            className="mt-4 ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                        >
                            {showAddForm ? "Скасувати" : "Додати нову роботу"}
                        </button>

                        {showAddForm && (
                            <div className="mt-4 p-4 border border-red-200 rounded bg-red-50 max-w-lg">
                                <input type="text" placeholder="Категорія" value={newWork.category}
                                       onChange={e => setNewWork(prev => ({ ...prev, category: e.target.value }))}
                                       className="w-full mb-2 px-2 py-1 border rounded"/>
                                <input type="text" placeholder="Назва роботи" value={newWork.name}
                                       onChange={e => setNewWork(prev => ({ ...prev, name: e.target.value }))}
                                       className="w-full mb-2 px-2 py-1 border rounded"/>
                                <input type="text" placeholder="Одиниця" value={newWork.unit}
                                       onChange={e => setNewWork(prev => ({ ...prev, unit: e.target.value }))}
                                       className="w-full mb-2 px-2 py-1 border rounded"/>
                                <input type="number" placeholder="Обсяг" value={newWork.volume}
                                       onChange={e => setNewWork(prev => ({ ...prev, volume: e.target.value }))}
                                       className="w-full mb-2 px-2 py-1 border rounded"/>
                                <button onClick={handleAddNewWork}
                                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
                                    Додати
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
