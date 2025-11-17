'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "../navbar/Navbar";

interface Work {
    _id: string;
    object: string;
    name: string;
    unit: string;
    volume: number;
    done: number;
    history?: { date: string }[];
}

export default function ReportsPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [objects, setObjects] = useState<string[]>([]);
    const [selectedObject, setSelectedObject] = useState("");
    const [months, setMonths] = useState<string[]>([]);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Отримуємо токен
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) router.push("/");
        else setToken(storedToken);
    }, [router]);

    // Завантаження об’єктів та формування місяців
    useEffect(() => {
        if (!token) return;
        const fetchObjects = async () => {
            try {
                const res = await axios.get<Work[]>(
                    "https://agricon-backend-1.onrender.com/works/full-data",
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const objs = Array.from(new Set(res.data.map(w => w.object))).filter(Boolean);
                setObjects(objs);

                // Збираємо всі місяці з історії
                const allMonthsSet = new Set<string>();
                res.data.forEach(w => {
                    w.history?.forEach(h => {
                        const d = new Date(h.date);
                        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}`;
                        allMonthsSet.add(monthStr);
                    });
                });
                const sortedMonths = Array.from(allMonthsSet).sort((a,b) => a < b ? 1 : -1);
                setMonths(sortedMonths);

            } catch (err: any) {
                console.error(err);
                setMessage(err.response?.data?.message || "Помилка при завантаженні об’єктів");
            }
        };
        fetchObjects();
    }, [token]);

    const sanitizeFileName = (name: string) =>
        encodeURIComponent(name.replace(/[^a-zA-Z0-9_-]/g, "_"));

    const handleDownload = async () => {
        if (!selectedObject) return setMessage("Будь ласка, оберіть об’єкт");

        setLoading(true);
        setMessage("");

        try {
            const monthParam =
                selectedMonth === "current" ? "current" : (selectedMonth || null);

            const res = await axios.post(
                "https://agricon-backend-1.onrender.com/works/report",
                {
                    object: selectedObject,
                    month: monthParam,
                    format: "excel"
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${sanitizeFileName(selectedObject)}_report.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (err: any) {
            console.error(err);
            setMessage(err.response?.data?.message || "Помилка при завантаженні звіту");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/3.jpg')" }}>
            <Navbar />

            <div className="max-w-4xl mx-auto mt-16 p-6">
                <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-8">
                    <h1 className="text-4xl font-extrabold mb-8 text-red-600 text-center">Генерація звітів</h1>

                    {/* Об’єкт */}
                    <div className="mb-6">
                        <label className="block mb-2 font-semibold text-gray-700">Об’єкт</label>
                        <select
                            value={selectedObject}
                            onChange={(e) => setSelectedObject(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-400 focus:outline-none transition"
                        >
                            <option value="">-- Оберіть --</option>
                            {objects.map(obj => <option key={obj} value={obj}>{obj}</option>)}
                        </select>
                    </div>

                    {/* Період */}
                    <div className="mb-8">
                        <label className="block mb-2 font-semibold text-gray-700">Період</label>
                        <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-400 focus:outline-none transition"
                        >
                            <option value="">-- Весь час --</option>
                            <option value="current">Поточний місяць</option>
                            {months.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    {/* Кнопка */}
                    <button
                        onClick={handleDownload}
                        disabled={loading || !selectedObject}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl shadow-lg transition transform hover:scale-105"
                    >
                        {loading ? "Завантаження..." : "Завантажити звіт"}
                    </button>

                    {message && <p className="mt-4 text-red-600 text-center">{message}</p>}
                </div>
            </div>
        </div>
    );
}
