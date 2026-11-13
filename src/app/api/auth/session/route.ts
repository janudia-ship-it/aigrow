import { NextResponse } from "next/server";
import {
  getAuthSession,
  clearAuthSession,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_PROFILE_COOKIE,
} from "@/lib/auth/session";
import { BACKEND_URL } from "@/lib/api/api-config";
import { AuthErrorCode } from "@/features/auth/types/auth.types";

export async function GET() {
  try {
    const { accessToken, user } = await getAuthSession();

    if (!accessToken) {
      return NextResponse.json(
        { authenticated: false, sessionExpired: false },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    // Check if session was terminated or invalidated on another device
    const isExpiredByOtherDevice =
      response.status === 401 ||
      data.errorCode === AuthErrorCode.SESSION_EXPIRED_OTHER_DEVICE ||
      data.errorCode === 2008 ||
      (typeof data.errorMessage === "string" &&
        data.errorMessage.toLowerCase().includes("session"));

    if (isExpiredByOtherDevice) {
      await clearAuthSession();
      const res = NextResponse.json(
        {
          authenticated: false,
          sessionExpired: true,
          errorCode: data.errorCode || AuthErrorCode.SESSION_EXPIRED_OTHER_DEVICE,
          errorMessage:
            data.errorMessage ||
            "Your session has expired because your account was logged in on another device.",
        },
        { status: 401 }
      );
      res.cookies.delete(ACCESS_TOKEN_COOKIE);
      res.cookies.delete(REFRESH_TOKEN_COOKIE);
      res.cookies.delete(USER_PROFILE_COOKIE);
      return res;
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          authenticated: false,
          sessionExpired: false,
          errorMessage: data.errorMessage || "Failed to validate session.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: data.data || user,
    });
  } catch {
    // If backend cannot be reached, return cached session to avoid false logouts during network drops
    const { user } = await getAuthSession();
    return NextResponse.json({
      authenticated: true,
      user,
      networkError: true,
    });
  }
}
