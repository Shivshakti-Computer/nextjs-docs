import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import RefreshToken from "@/models/RefreshToken";

export const runtime = "nodejs";

export async function POST() {
    console.log("🚪 Logout request received");

    try {
        await connectDB();

        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

        if (refreshToken) {
            await RefreshToken.deleteOne({ token: refreshToken });
            console.log("🗑 Refresh token removed from DB");
        }

        const response = NextResponse.json(
            { message: "Logged out successfully" },
            { status: 200 }
        );

        // Delete cookies
        response.cookies.set("accessToken", "", {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            path: "/",
            maxAge: 0
        });

        response.cookies.set("refreshToken", "", {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            path: "/",
            maxAge: 0
        });

        console.log("🍪 Cookies cleared");

        return response;

    } catch (error: any) {
        console.error("🔥 LOGOUT ERROR:", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}