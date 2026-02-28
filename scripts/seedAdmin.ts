import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User";

async function seed() {
    await mongoose.connect("mongodb://127.0.0.1:27017/secure-auth-pro");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin"
    });

    console.log("Admin created");
    process.exit();
}

seed();