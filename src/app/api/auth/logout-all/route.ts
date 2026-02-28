import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import RefreshToken from "@/models/RefreshToken";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

export async function POST() {
    await connectDB();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(
        accessToken,
        process.env.JWT_SECRET as string
    );

    await RefreshToken.deleteMany({ userId: decoded.userId });

    const response = NextResponse.json(
        { message: "Logged out from all devices" },
        { status: 200 }
    );

    response.cookies.set("accessToken", "", { maxAge: 0 });
    response.cookies.set("refreshToken", "", { maxAge: 0 });

    return response;
}