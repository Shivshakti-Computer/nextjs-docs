import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import RefreshToken from "@/models/RefreshToken";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import jwt from "jsonwebtoken";
import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(req: Request) {
    console.log("🔄 Refresh request received");

    try {
        await connectDB();

        const cookieHeader = req.headers.get("cookie");

        if (!cookieHeader) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const refreshToken = cookieHeader
            .split("; ")
            .find(row => row.startsWith("refreshToken="))
            ?.split("=")[1];

        if (!refreshToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Verify signature
        const decoded: any = jwt.verify(
            refreshToken,
            process.env.JWT_SECRET as string
        );

        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
            await RefreshToken.deleteMany({ userId: decoded.userId });
            return NextResponse.json({ message: "Account disabled" }, { status: 403 });
        }

        const storedToken = await RefreshToken.findOne({ token: refreshToken });

        if (!storedToken) {
            return NextResponse.json({ message: "Invalid token" }, { status: 403 });
        }

        if (new Date(storedToken.expiresAt) < new Date()) {
            return NextResponse.json({ message: "Expired token" }, { status: 403 });
        }

        // 🔥 ROTATION STARTS HERE

        // Delete old refresh token
        await RefreshToken.deleteOne({ token: refreshToken });

        // Generate new tokens
        const newAccessToken = generateAccessToken({
            userId: decoded.userId
        });

        const newRefreshToken = generateRefreshToken({
            userId: decoded.userId
        });

        // Store new refresh token
        await RefreshToken.create({
            token: newRefreshToken,
            userId: decoded.userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        const response = NextResponse.json(
            { message: "Token refreshed" },
            { status: 200 }
        );

        response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 15
        });

        response.cookies.set("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7
        });

        console.log("🔁 Refresh token rotated successfully");

        return response;

    } catch (error: any) {
        console.error("🔥 REFRESH ERROR:", error);
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
}