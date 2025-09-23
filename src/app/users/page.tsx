"use client";

import { useState } from "react";
import axios from "axios";

export default function UsersPage() {
    const [form, setForm] = useState({ name: "", email: "", role: "user" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("http://localhost:3002/works/create", form);
            setForm({ name: "", email: "", role: "user" });
            alert("Користувач створений. Логін і пароль надіслані на email.");
        } catch (err) {
            console.error("Помилка створення користувача", err);
            alert("Не вдалося створити користувача");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-6">Створення користувача</h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-4 p-4 border rounded-lg shadow-md bg-white"
            >
                <input
                    type="text"
                    placeholder="Ім’я"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border p-2 rounded"
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border p-2 rounded"
                    required
                />

                <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full border p-2 rounded"
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
                >
                    {loading ? "Створюємо..." : "Створити користувача"}
                </button>
            </form>
        </div>
    );
}
