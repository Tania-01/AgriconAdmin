"use client";

import React from "react";
import axios from "axios";

interface DeleteObjectButtonProps {
    objectName: string;
    onDeleted: () => void; // колбек для оновлення списку після видалення
}

const DeleteObjectButton: React.FC<DeleteObjectButtonProps> = ({ objectName, onDeleted }) => {
    const handleDelete = async () => {
        if (!window.confirm(`Ви впевнені, що хочете видалити об’єкт "${objectName}"?`)) return;

        try {
            const encodedName = encodeURIComponent(objectName);
            const res = await axios.delete(`http://localhost:3000/works/object/${encodedName}`);
            alert(res.data.message);
            onDeleted();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Помилка при видаленні");
        }
    };

    return (
        <button
            onClick={handleDelete}
            style={{
                backgroundColor: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: 6,
                padding: "8px 14px",
                cursor: "pointer",
            }}
        >
            🗑️ Видалити об’єкт
        </button>
    );
};

export default DeleteObjectButton;
