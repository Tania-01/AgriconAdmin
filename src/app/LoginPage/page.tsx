'use client';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const tokenExpiry = localStorage.getItem("tokenExpiry");

        if (token && tokenExpiry && Date.now() < Number(tokenExpiry)) {
            router.push("/");
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                "https://agricon-backend-1.onrender.com/works/sign-in",
                { email, password }
            );

            const { token, user } = response.data;

            if (user.role !== "admin" && user.role !== "manager") {
                setError("Доступ заборонено. Лише для адмінів.");
                setLoading(false);
                return;
            }

            localStorage.setItem("token", token);
            localStorage.setItem("tokenExpiry", String(Date.now() + 60 * 60 * 1000));

            router.push("/");
        } catch (err: any) {
            setError(err.response?.data?.message || "Помилка входу");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="relative flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat p-6"
            style={{ backgroundImage: "url('/3.jpg')" }}
        >
            <div className="relative z-10 w-full max-w-md p-10 bg-white shadow-2xl rounded-2xl border border-gray-200">

                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#e30613]">
                        AGRICON
                    </h1>
                    <p className="text-gray-700 mt-2 text-lg font-semibold">
                        Адмін Панель
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <p className="text-red-500 text-sm font-medium">{error}</p>
                    )}

                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e30613]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e30613]"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#e30613] text-white font-semibold rounded-lg shadow hover:bg-red-700 transition"
                    >
                        {loading ? "Завантаження..." : "Увійти"}
                    </button>
                </form>
            </div>
        </div>
    );
}
