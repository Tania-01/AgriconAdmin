'use client';

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../navbar/Navbar";

const API_URL = "https://agricon-backend-1.onrender.com";

// ================= TYPES =================
type Delivery = {
    qty: number;
    date: string;
};

type Row = {
    name: string;
    quantity: string;
    unit: string;
    nomenclatureGroup?: string;
    deliveries?: Delivery[];
};

type Order = {
    _id: string;
    orderNumber: string;
    status: string;
    rows: Row[];
    createdAt?: string;
    deliveryDate?: string;
    customer?: { name: string };
    object?: { object: string; city?: string };
};

type Work = {
    _id: string;
    object: string;
    city?: string;
    nomenclatureGroup?: string;
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [works, setWorks] = useState<Work[]>([]);
    const [opened, setOpened] = useState<Order | null>(null);

    const [cityFilter, setCityFilter] = useState("");

    const getToken = () =>
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers = {
        Authorization: `Bearer ${getToken()}`,
    };

    // ================= TOKEN CHECK =================
    useEffect(() => {
        if (!getToken()) {
            window.location.href = "/login";
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        fetchWorks();
    }, []);

    const fetchOrders = async () => {
        const res = await axios.get(`${API_URL}/orders`, { headers });
        setOrders(res.data || []);
    };

    const fetchWorks = async () => {
        const res = await axios.get(`${API_URL}/works/full-data`, { headers });
        setWorks(res.data || []);
    };

    // ================= STATUS =================
    const calcStatus = (rows: Row[]) => {
        let total = 0;
        let done = 0;
        let hasGroup = false;

        rows.forEach(r => {
            const t = Number(r.quantity || 0);
            const d = r.deliveries?.reduce((s, x) => s + x.qty, 0) || 0;

            total += t;
            done += d;

            if (r.nomenclatureGroup) hasGroup = true;
        });

        if (!hasGroup && done === 0) return "нове";
        if (hasGroup && done === 0) return "в процесі";
        if (done < total) return "частково виконано";
        return "виконано";
    };

    const getDelivered = (r: Row) =>
        r.deliveries?.reduce((s, d) => s + d.qty, 0) || 0;

    // ================= GROUPS =================
    const groupsForObject = useMemo(() => {
        if (!opened?.object?.object) return [];

        return [
            ...new Set(
                works
                    .filter(w => w.object === opened.object?.object)
                    .map(w => w.nomenclatureGroup)
                    .filter(Boolean)
            ),
        ];
    }, [works, opened]);

    // ================= UPDATE =================
    const updateRow = (i: number, value: string) => {
        if (!opened) return;
        const rows = [...opened.rows];
        rows[i].nomenclatureGroup = value;
        setOpened({ ...opened, rows });
    };

    const addDelivery = (i: number) => {
        if (!opened) return;

        const qty = prompt("Кількість:");
        if (!qty) return;

        const rows = [...opened.rows];

        rows[i].deliveries = [
            ...(rows[i].deliveries || []),
            { qty: Number(qty), date: new Date().toISOString() },
        ];

        setOpened({ ...opened, rows });
    };

    const saveOrder = async () => {
        if (!opened) return;

        await axios.put(
            `${API_URL}/orders/${opened._id}`,
            { rows: opened.rows },
            { headers }
        );

        const status = calcStatus(opened.rows);

        await axios.patch(
            `${API_URL}/orders/${opened._id}/status`,
            { status },
            { headers }
        );

        fetchOrders();
        setOpened(null);
    };

    const exportOrder = async (id: string) => {
        const res = await axios.get(`${API_URL}/orders/${id}/export`, {
            headers,
            responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement("a");
        a.href = url;
        a.download = `order-${id}.xlsx`;
        a.click();
    };

    const columns = ["нове", "в процесі", "частково виконано", "виконано"];

    return (
        <div className="min-h-screen bg-white text-black">

            {/* HEADER */}
            <Navbar />

            <div className="p-6">

                <h1 className="text-xl font-semibold mb-4">
                    Замовлення
                </h1>

                {/* CITY FILTER */}
                <div className="mb-4">
                    <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="border px-3 py-2 rounded"
                    >
                        <option value="">Всі міста</option>
                        {Array.from(
                            new Set(orders.map(o => o.object?.city).filter(Boolean))
                        ).map(city => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                </div>

                {/* BOARD */}
                <div className="grid grid-flow-col auto-cols-[280px] gap-4 overflow-x-auto pb-4">

                    {columns.map(col => (
                        <div
                            key={col}
                            className="w-[280px] bg-red-50 border border-red-200 rounded-lg p-3"
                        >
                            <h3 className="font-semibold text-red-600 mb-3">
                                {col}
                            </h3>

                            {orders
                                .filter(o => o.status === col)
                                .filter(o => cityFilter ? o.object?.city === cityFilter : true)
                                .map(o => (
                                    <div
                                        key={o._id}
                                        onClick={() => setOpened(o)}
                                        className="bg-white border border-red-200 rounded-md p-3 mb-2 cursor-pointer hover:bg-red-50"
                                    >
                                        <b>#{o.orderNumber}</b>
                                        <div>{o.customer?.name || "—"}</div>
                                        <div className="text-sm text-gray-500">
                                            {o.object?.object}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ))}

                </div>

                {/* MODAL (UNCHANGED) */}
                {opened && (
                    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
                        <div className="bg-white w-[1000px] rounded-xl p-6 shadow-xl">

                            <h2 className="text-lg font-semibold mb-4">
                                Замовлення #{opened.orderNumber}
                            </h2>

                            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                                <div><b>Замовник:</b> {opened.customer?.name || "—"}</div>
                                <div><b>Об’єкт:</b> {opened.object?.object}</div>
                                <div><b>Місто:</b> {opened.object?.city}</div>
                                <div><b>Дата:</b> {opened.createdAt?.slice(0,10)}</div>
                                <div><b>Поставка:</b> {opened.deliveryDate?.slice(0,10)}</div>
                            </div>

                            <table className="w-full border border-red-200 text-sm">
                                <thead className="bg-red-600 text-white">
                                <tr>
                                    <th className="p-2">Назва</th>
                                    <th>К-сть</th>
                                    <th>Група</th>
                                    <th>Видано</th>
                                    <th></th>
                                </tr>
                                </thead>

                                <tbody>
                                {opened.rows.map((r, i) => (
                                    <tr key={i} className="border-t">
                                        <td className="p-2">{r.name}</td>
                                        <td>{r.quantity}</td>

                                        <td>
                                            {opened.status === "нове" ? (
                                                <select
                                                    value={r.nomenclatureGroup || ""}
                                                    onChange={e => updateRow(i, e.target.value)}
                                                    className="border px-2 py-1 rounded"
                                                >
                                                    <option value="">—</option>
                                                    {groupsForObject.map((g, idx) => (
                                                        <option key={idx}>{g}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                r.nomenclatureGroup || "-"
                                            )}
                                        </td>

                                        <td>{getDelivered(r)} / {r.quantity}</td>

                                        <td>
                                            {opened.status !== "нове" && (
                                                <button
                                                    onClick={() => addDelivery(i)}
                                                    className="bg-blue-500 text-white px-2 py-1 rounded"
                                                >
                                                    +
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            <button
                                onClick={saveOrder}
                                className="w-full mt-4 bg-red-600 text-white py-2 rounded"
                            >
                                Зберегти
                            </button>

                            <button
                                onClick={() => exportOrder(opened._id)}
                                className="w-full mt-2 bg-blue-500 text-white py-2 rounded"
                            >
                                Завантажити звіт
                            </button>

                            <button
                                onClick={() => setOpened(null)}
                                className="w-full mt-2 bg-gray-300 py-2 rounded"
                            >
                                Закрити
                            </button>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
