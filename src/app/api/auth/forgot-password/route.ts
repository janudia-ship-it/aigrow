import { NextResponse } from "next/server";
import { forgotPassword } from "@/features/auth/services/auth-api";
import { forgotPasswordSchema } from "@/features/auth/schemas/auth.schema";

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));

        // Validate email
        const validation = forgotPasswordSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: validation.error.issues[0]?.message || "Invalid email address.",
                },
                { status: 400 }
            );
        }

        // Call backend API
        const result = await forgotPassword(validation.data);

        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        console.error("Forgot password error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again.",
            },
            { status: 400 }
        );
    }
}
