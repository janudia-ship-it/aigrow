import { NextRequest, NextResponse } from "next/server";
import { resendOtp } from "@/features/auth/services/auth-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const userName =
      typeof body.userName === "string"
        ? body.userName.trim()
        : typeof body.username === "string"
        ? body.username.trim()
        : "";

    const identifier = userName || email;

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: "Username or email is required." },
        { status: 400 }
      );
    }

    const result = await resendOtp({
      userName: identifier,
      email: email || identifier,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to resend verification code.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
