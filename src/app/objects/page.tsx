'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Work {
    _id: string;
    object: string;
    category: string;
    name: string;
    unit: string;
    volume: number;
    done: number;
    history: any[];
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
    const [selectedObject, setSelectedObject] = useState<string | null>(null);
    const [responsibles, setResponsibles] = useState<Responsible[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [worksRes, respRes, usersRes] = await Promise.all([
                    axios.get('http://localhost:3002/works/full-data'),
                    axios.get('http://localhost:3002/works/object-responsibles'),
                    axios.get('http://localhost:3002/works/getUser')
                ]);
                setWorks(worksRes.data);
                setResponsibles(respRes.data);
                setUsers(usersRes.data);
            } catch (err) {
                console.error('Помилка завантаження даних:', err);
            }
        };
        fetchData();
    }, []);

    const objects = Array.from(new Set(works.map(w => w.object)));

    const filteredWorks = selectedObject
        ? works.filter(w => w.object === selectedObject)
        : [];

    const currentResponsibles = selectedObject
        ? responsibles.find(r => r.objectName === selectedObject)?.responsibles || []
        : [];

    const handleAddResponsible = async () => {
        if (!selectedObject || !selectedUserId) return;

        try {
            const res = await axios.post('http://localhost:3002/works/respons', {
                objectName: selectedObject,
                userId: selectedUserId
            });

            // Оновлюємо локальний стейт
            setResponsibles(prev => {
                const exists = prev.find(r => r.objectName === selectedObject);
                if (exists) {
                    return prev.map(r =>
                        r.objectName === selectedObject ? res.data : r
                    );
                } else {
                    return [...prev, res.data];
                }
            });

            setSelectedUserId(""); // очистка select
        } catch (err) {
            console.error('Помилка додавання відповідального:', err);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Об’єкти</h1>

            <div className="flex flex-wrap gap-2 mb-6">
                {objects.map((obj, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setSelectedObject(obj);
                            setSelectedUserId("");
                        }}
                        className={`px-4 py-2 rounded-md border 
                            ${selectedObject === obj ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}
                        `}
                    >
                        {obj}
                    </button>
                ))}
            </div>

            {selectedObject && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Об’єкт: {selectedObject}</h2>

                    <div className="mb-4">
                        <div className="mb-2">
                            <span>Поточні відповідальні:</span>
                            {currentResponsibles.length > 0 ? (
                                <ul className="list-disc list-inside ml-4">
                                    {currentResponsibles.map(u => (
                                        <li key={u._id}>{u.name} ({u.email})</li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="font-semibold"> не вказано</span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <select
                                value={selectedUserId}
                                onChange={e => setSelectedUserId(e.target.value)}
                                className="border px-2 py-1 rounded-md w-64"
                            >
                                <option value="">Оберіть користувача</option>
                                {users.map(u => (
                                    <option key={u._id} value={u._id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddResponsible}
                                className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600"
                            >
                                Додати
                            </button>
                        </div>
                    </div>

                    <table className="w-full border border-gray-300">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-1">Категорія</th>
                            <th className="border px-2 py-1">Назва роботи</th>
                            <th className="border px-2 py-1">Одиниця</th>
                            <th className="border px-2 py-1">Обсяг</th>
                            <th className="border px-2 py-1">Виконано</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredWorks.map((work, i) => (
                            <tr key={work._id || i}>
                                <td className="border px-2 py-1">{work.category}</td>
                                <td className="border px-2 py-1">{work.name}</td>
                                <td className="border px-2 py-1">{work.unit}</td>
                                <td className="border px-2 py-1">{work.volume}</td>
                                <td className="border px-2 py-1">{work.done}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
