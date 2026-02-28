import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import RefreshToken from "@/models/RefreshToken";
import bcrypt from "bcryptjs";
import {
    generateAccessToken,
    generateRefreshToken
} from "@/lib/jwt";

export async function POST(req: Request) {
    console.log("🔵 Login request received");

    try {
        await connectDB();
        console.log("🟢 DB connected");

        const body = await req.json();
        const { email, password } = body;

        console.log("📩 Incoming Data:", { email });

        if (!email || !password) {
            console.log("❌ Missing fields");
            return NextResponse.json(
                { message: "Email and password required" },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ User not found");
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        if (!user.isActive) {
            console.log("❌ Account disabled");
            return NextResponse.json(
                { message: "Account disabled" },
                { status: 403 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("❌ Password mismatch");
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        console.log("✅ Password verified");

        // Convert ObjectId safely
        const userId = user._id.toString();

        const accessToken = generateAccessToken({
            userId,
            role: user.role
        });

        const refreshToken = generateRefreshToken({
            userId
        });

        console.log("🔐 Tokens generated");

        // Save refresh token in DB
        await RefreshToken.create({
            token: refreshToken,
            userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        console.log("💾 Refresh token stored in DB");

        // Create response
        const response = NextResponse.json(
            { message: "Login successful" },
            { status: 200 }
        );

        // Set cookies (localhost safe)
        response.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: false, // localhost
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 15
        });

        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // localhost
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7
        });

        console.log("🍪 Cookies set successfully");

        return response;

    } catch (error: any) {
        console.error("🔥 LOGIN ERROR:", error);
        return NextResponse.json(
            {
                message: "Server error",
                error: error?.message || "Unknown error"
            },
            { status: 500 }
        );
    }
}