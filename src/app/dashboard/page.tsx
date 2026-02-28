import { redirect } from "next/navigation";
import { verifyAndRefresh } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Dashboard() {
    const isValid = await verifyAndRefresh();

    if (!isValid) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
            <h1 className="text-4xl font-bold mb-6">
                Welcome to Dashboard 🚀
            </h1>

            <LogoutButton />
        </div>
    );
}