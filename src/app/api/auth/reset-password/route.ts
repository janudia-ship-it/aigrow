import { NextResponse } from "next/server";
import { resetPassword } from "@/features/auth/services/auth-api";
import { resetPasswordSchema } from "@/features/auth/schemas/auth.schema";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => ({}));
    const body = {
      ...rawBody,
      newPassword: rawBody.newPassword || rawBody.newpassword,
      confirmPassword:
        rawBody.confirmPassword ||
        rawBody.confirmpassword ||
        rawBody.newPassword ||
        rawBody.newpassword,
    };

    // Validate request body
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error.issues[0]?.message || "Invalid reset password request.",
        },
        { status: 400 }
      );
    }

    // Call backend API with email, code, newPassword
    const result = await resetPassword({
      email: validation.data.email,
      code: validation.data.code,
      newPassword: validation.data.newPassword,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      },
      { status: 400 }
    );
  }
}
