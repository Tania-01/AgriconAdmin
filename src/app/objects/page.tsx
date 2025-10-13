'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../navbar/Navbar';

interface Work {
    _id: string;
    city: string;
    object: string;
    category: string;
    name: string;
    unit: string;
    volume: number;
    done: number;
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
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [newWork, setNewWork] = useState({
        category: "",
        name: "",
        unit: "",
        volume: "",
        done: "",
    });
    const [showNewWorkForm, setShowNewWorkForm] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [worksRes, respRes, usersRes] = await Promise.all([
                    axios.get('https://agricon-backend-1.onrender.com/works/full-data'),
                    axios.get('https://agricon-backend-1.onrender.com/works/object-responsibles'),
                    axios.get('https://agricon-backend-1.onrender.com/works/getUser'),
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

    const cities = Array.from(new Set(works.map(w => w.city)));

    const objects = selectedCity
        ? Array.from(new Set(works.filter(w => w.city === selectedCity).map(w => w.object)))
        : [];

    const filteredWorks = selectedObject
        ? works.filter(w => w.object === selectedObject)
        : [];

    const currentResponsibles = selectedObject
        ? responsibles.find(r => r.objectName === selectedObject)?.responsibles || []
        : [];

    const handleAddResponsible = async () => {
        if (!selectedObject || !selectedUserId) return;

        try {
            const res = await axios.post('https://agricon-backend-1.onrender.com/works/respons', {
                objectName: selectedObject,
                userId: selectedUserId,
            });

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

            setSelectedUserId("");
        } catch (err) {
            console.error('Помилка додавання відповідального:', err);
        }
    };

    const handleAddNewWork = async () => {
        if (!selectedObject || !selectedCity) return;

        try {
            await axios.post('https://agricon-backend-1.onrender.com/works/extraWork', {
                city: selectedCity,
                object: selectedObject,
                category: newWork.category,
                name: newWork.name,
                unit: newWork.unit,
                volume: parseFloat(newWork.volume),
                done: parseFloat(newWork.done),
            });

            alert("Роботу успішно додано!");
            setShowNewWorkForm(false);
            setNewWork({ category: "", name: "", unit: "", volume: "", done: "" });

            // оновити список
            const res = await axios.get('https://agricon-backend-1.onrender.com/works/full-data');
            setWorks(res.data);
        } catch (err) {
            console.error('Помилка при додаванні роботи:', err);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar /> {/* 🔺 Навбар зверху */}

            <div className="p-6">

                {/* === МІСТА === */}
                <h2 className="text-xl font-semibold mb-2">Оберіть місцерозташування:</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                    {cities.map((city, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setSelectedCity(city);
                                setSelectedObject(null);
                            }}
                            className={`px-4 py-2 rounded-md border font-medium transition ${
                                selectedCity === city
                                    ? 'bg-red-600 text-white border-red-700'
                                    : 'bg-white text-red-600 border-red-600 hover:bg-red-50'
                            }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>

                {/* === ОБ’ЄКТИ === */}
                {selectedCity && (
                    <>
                        <h2 className="text-xl font-semibold mb-2 text-red-700">
                            Проекти у місті: {selectedCity}
                        </h2>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {objects.map((obj, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedObject(obj)}
                                    className={`px-4 py-2 rounded-md border font-medium transition ${
                                        selectedObject === obj
                                            ? 'bg-red-500 text-white border-red-600'
                                            : 'bg-white text-red-600 border-red-600 hover:bg-red-50'
                                    }`}
                                >
                                    {obj}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* === ДЕТАЛІ ОБ’ЄКТА === */}
                {selectedObject && (
                    <div className="border-t border-gray-300 pt-6">
                        <h2 className="text-xl font-semibold mb-3 text-red-600">
                            Проект: {selectedObject}
                        </h2>

                        {/* Відповідальні */}
                        <div className="mb-4 bg-red-50 p-3 rounded-md border border-red-200">
                            <div className="mb-2">
                                <span className="font-semibold">Поточні відповідальні:</span>
                                {currentResponsibles.length > 0 ? (
                                    <ul className="list-disc list-inside ml-4 text-sm">
                                        {currentResponsibles.map(u => (
                                            <li key={u._id}>
                                                {u.name} <span className="text-gray-600">({u.email})</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="font-semibold text-gray-600"> не вказано</span>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <select
                                    value={selectedUserId}
                                    onChange={e => setSelectedUserId(e.target.value)}
                                    className="border border-red-400 px-2 py-1 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-red-400"
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
                                    className="bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700 transition"
                                >
                                    Додати
                                </button>
                            </div>
                        </div>

                        {/* Таблиця */}
                        <table className="w-full border border-red-300 shadow-sm">
                            <thead className="bg-red-600 text-white">
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
                                <tr
                                    key={work._id || i}
                                    className={i % 2 === 0 ? 'bg-white' : 'bg-red-50'}
                                >
                                    <td className="border px-2 py-1">{work.category}</td>
                                    <td className="border px-2 py-1">{work.name}</td>
                                    <td className="border px-2 py-1">{work.unit}</td>
                                    <td className="border px-2 py-1">
                                        {typeof work.volume === "number" ? work.volume.toFixed(2) : work.volume}
                                    </td>
                                    <td className="border px-2 py-1">
                                        {typeof work.done === "number" ? work.done.toFixed(2) : work.done}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {/* Кнопка додавання */}
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowNewWorkForm(prev => !prev)}
                                className="bg-red-600 text-white text-xl font-bold rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-700 transition"
                            >
                                +
                            </button>
                        </div>

                        {/* Форма нової роботи */}
                        {showNewWorkForm && (
                            <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
                                <h3 className="font-semibold text-red-700 mb-2">Нова робота</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Категорія"
                                        value={newWork.category}
                                        onChange={(e) => setNewWork({ ...newWork, category: e.target.value })}
                                        className="border p-2 rounded"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Назва"
                                        value={newWork.name}
                                        onChange={(e) => setNewWork({ ...newWork, name: e.target.value })}
                                        className="border p-2 rounded"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Одиниця"
                                        value={newWork.unit}
                                        onChange={(e) => setNewWork({ ...newWork, unit: e.target.value })}
                                        className="border p-2 rounded"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Обсяг"
                                        value={newWork.volume}
                                        onChange={(e) => setNewWork({ ...newWork, volume: e.target.value })}
                                        className="border p-2 rounded"
                                        step="0.01"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Виконано"
                                        value={newWork.done}
                                        onChange={(e) => setNewWork({ ...newWork, done: e.target.value })}
                                        className="border p-2 rounded"
                                        step="0.01"
                                    />
                                </div>
                                <button
                                    onClick={handleAddNewWork}
                                    className="bg-red-600 text-white px-4 py-2 rounded mt-3 hover:bg-red-700 transition"
                                >
                                    Додати роботу
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
