import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {
        await connectDB();

        const {email, password} = await req.json();

        if (!email || !password){
            return NextResponse.json(
                {message: "All fields are required"},
                {status: 400}
            )
        }

        const existingUser = await User.findOne({email});
        if (existingUser){
            return NextResponse.json(
                {message: "User already exists"},
                {status: 400}
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            email,
            password: hashedPassword
        });

        return NextResponse.json(
                {message: "User Registerd Successfully"},
                {status: 201}
            )
        
    } catch (error) {
        return NextResponse.json(
            {message: 'Server Error'},
            {status: 500}
        )
    }
}