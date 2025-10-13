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

export default function ReportsPage() {
    const [works, setWorks] = useState<Work[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [objects, setObjects] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedObject, setSelectedObject] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('https://agricon-backend-1.onrender.com/works/full-data');
                const data: Work[] = res.data;

                setWorks(data);

                const uniqueCities: string[] = Array.from(new Set(data.map((w: Work) => w.city)));
                setCities(uniqueCities);

                const uniqueObjects: string[] = Array.from(new Set(data.map((w: Work) => w.object)));
                setObjects(uniqueObjects);
            } catch (err) {
                console.error('Помилка завантаження даних:', err);
            }
        };

        fetchData();
    }, []);

    const filteredObjects = selectedCity
        ? Array.from(new Set(works.filter((w) => w.city === selectedCity).map((w) => w.object)))
        : [];

    const filteredWorks = selectedObject
        ? works.filter((w) => w.object === selectedObject)
        : [];

    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar />

            <div className="p-6 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center text-red-600">
                    Звіти: Міста та Роботи
                </h1>

                {/* Міста */}
                <h2 className="text-xl font-semibold mb-2">Оберіть місто:</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                    {cities.map((city) => (
                        <button
                            key={city}
                            onClick={() => {
                                setSelectedCity(city);
                                setSelectedObject('');
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

                {/* Об’єкти */}
                {selectedCity && (
                    <>
                        <h2 className="text-xl font-semibold mb-2 text-red-700">
                            Об’єкти у місті: {selectedCity}
                        </h2>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {filteredObjects.map((obj) => (
                                <button
                                    key={obj}
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

                {/* Роботи */}
                {selectedObject && (
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
                            <tr key={work._id} className={i % 2 === 0 ? 'bg-white' : 'bg-red-50'}>
                                <td className="border px-2 py-1">{work.category}</td>
                                <td className="border px-2 py-1">{work.name}</td>
                                <td className="border px-2 py-1">{work.unit}</td>
                                <td className="border px-2 py-1">{work.volume.toFixed(2)}</td>
                                <td className="border px-2 py-1">{work.done.toFixed(2)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
