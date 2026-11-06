import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/features/auth/services/auth-api";
import { ApiError } from "@/lib/api/api-error";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_PROFILE_COOKIE,
} from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, password, clientType = "Web", rememberMe = false } = body;

    if (!userName || !password) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 400,
          errorMessage: "Username and password are required.",
        },
        { status: 400 }
      );
    }

    const authData = await loginUser({
      userName,
      password,
      clientType,
    });

    const isProd = process.env.NODE_ENV === "production";
    const maxAge = rememberMe ? 60 * 60 * 24 * 7 : undefined;

    const response = NextResponse.json({
      success: true,
      errorCode: 0,
      message: "Login successful",
      user: authData.user,
    });

    // Set secure cookies
    response.cookies.set(ACCESS_TOKEN_COOKIE, authData.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: maxAge ?? 60 * 15,
    });

    response.cookies.set(REFRESH_TOKEN_COOKIE, authData.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set(USER_PROFILE_COOKIE, JSON.stringify(authData.user), {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: maxAge ?? 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      const status = error.status && error.status >= 400 ? error.status : 400;
      return NextResponse.json(
        {
          success: false,
          errorCode: error.errorCode,
          errorMessage: error.message,
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        errorCode: 500,
        errorMessage: "Internal server error occurred.",
      },
      { status: 500 }
    );
  }
}

