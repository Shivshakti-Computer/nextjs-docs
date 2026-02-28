import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function verifyAndRefresh() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) return { valid: false };

    try {
        const decoded: any = jwt.verify(
            accessToken,
            process.env.JWT_SECRET as string
        );

        return { valid: true, user: decoded };

    } catch {
        return { valid: false };
    }
}