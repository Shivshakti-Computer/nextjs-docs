import { redirect } from "next/navigation";
import { verifyAndRefresh } from "@/lib/auth";

export default async function AdminPage() {
    const auth = await verifyAndRefresh();

    if (!auth.valid) {
        redirect("/login");
    }

    if (auth.user.role !== "admin") {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <h1 className="text-4xl font-bold">
                Admin Panel 👑
            </h1>
        </div>
    );
}