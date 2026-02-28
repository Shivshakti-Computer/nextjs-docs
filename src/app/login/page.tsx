"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        const data = await res.json();

        setMessage(data.message);
        setLoading(false);

        if (res.status === 200) {
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-900">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-96 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">
                    Welcome Back
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                        required
                    />

                    <button
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-white p-3 rounded-lg font-semibold"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {message && (
                    <p className="text-center text-sm text-red-400 mt-4">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}