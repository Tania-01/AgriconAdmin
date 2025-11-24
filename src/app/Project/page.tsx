'use client';
import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "../navbar/Navbar";

interface Work {
    _id: string;
    object: string;
    name: string;
    unit: string;
    volume: number;
    history?: { date: string }[];
}

export default function AddProjectPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [objects, setObjects] = useState<string[]>([]);
    const [selectedObject, setSelectedObject] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Отримуємо токен
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) router.push("/");
        else setToken(storedToken);
    }, [router]);

    // Завантаження об’єктів без дублювання
    useEffect(() => {
        if (!token) return;

        const fetchObjects = async () => {
            try {
                const res = await axios.get<Work[]>(
                    "https://agricon-backend-1.onrender.com/works/full-data",
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const uniqueObjects = Array.from(new Set(res.data.map(w => w.object))).filter(Boolean);
                setObjects(uniqueObjects);
            } catch (err: any) {
                console.error(err);
                setMessage(err.response?.data?.message || "Помилка при завантаженні об’єктів");
            }
        };

        fetchObjects();
    }, [token]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedObject) return setMessage("Будь ласка, оберіть об’єкт");
        if (!file) return setMessage("Будь ласка, оберіть файл PDF");

        setLoading(true);
        setMessage("");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("object", selectedObject);

            const res = await axios.post(
                `https://agricon-backend-1.onrender.com/works/upload/${encodeURIComponent(selectedObject)}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setMessage("Проект успішно додано!");
            setFile(null);
            setSelectedObject("");
        } catch (err: any) {
            console.error(err);
            setMessage(err.response?.data?.message || "Помилка при додаванні проекту");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/3.jpg')" }}>
            <Navbar />
            <div className="max-w-3xl mx-auto mt-16 p-6">
                <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-8">
                    <h1 className="text-4xl font-extrabold mb-8 text-red-600 text-center">Додати проект з PDF</h1>

                    {/* Вибір об’єкта */}
                    <div className="mb-6">
                        <label className="block mb-2 font-semibold text-gray-700">Об’єкт</label>
                        <select
                            value={selectedObject}
                            onChange={e => setSelectedObject(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-400 focus:outline-none transition"
                        >
                            <option value="">-- Оберіть --</option>
                            {objects.map(obj => (
                                <option key={obj} value={obj}>{obj}</option>
                            ))}
                        </select>
                    </div>

                    {/* Вибір файлу PDF */}
                    <div className="mb-6">
                        <label className="block mb-2 font-semibold text-gray-700">Файл PDF</label>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-400 focus:outline-none transition"
                        />
                    </div>

                    {/* Кнопка завантаження */}
                    <button
                        onClick={handleUpload}
                        disabled={loading || !selectedObject || !file}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl shadow-lg transition transform hover:scale-105"
                    >
                        {loading ? "Завантаження..." : "Додати проект"}
                    </button>

                    {message && <p className="mt-4 text-red-600 text-center">{message}</p>}
                </div>
            </div>
        </div>
    );
}
