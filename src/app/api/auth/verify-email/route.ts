import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/features/auth/services/auth-api";

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
    const otp =
      typeof body.otp === "string"
        ? body.otp.trim()
        : typeof body.code === "string"
        ? body.code.trim()
        : "";

    const identifier = userName || email;

    if (!identifier || !otp) {
      return NextResponse.json(
        { success: false, message: "Username and OTP code are required." },
        { status: 400 }
      );
    }

    const result = await verifyOtp({
      userName: identifier,
      email: email || identifier,
      otp,
    });

    return NextResponse.json({
      success: true,
      verified: result.verified,
      message: result.message,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Email verification failed.";
    return NextResponse.json(
      { success: false, verified: false, message },
      { status: 400 }
    );
  }
}
