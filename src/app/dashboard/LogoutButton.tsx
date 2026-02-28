"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST"
        });

        router.push("/login");
    };

    return (
        <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 transition rounded-lg"
        >
            Logout
        </button>
    );
}