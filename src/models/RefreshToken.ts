import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        token: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        expiresAt: { type: Date, required: true }
    },
    { timestamps: true }
);

export default mongoose.models.RefreshToken ||
    mongoose.model("RefreshToken", refreshTokenSchema);