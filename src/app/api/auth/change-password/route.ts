import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_PROFILE_COOKIE,
  clearAuthSession,
} from "@/lib/auth/session";
import { changePasswordSchema } from "@/features/profile/schemas/profile.schema";
import { changePasswordApi } from "@/features/profile/services/profile-api";
import { ApiError } from "@/lib/api/api-error";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          errorMessage:
            validation.error.issues[0]?.message || "Invalid input data.",
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;

    const result = await changePasswordApi(validation.data, accessToken);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Change password route error:", error);

    if (error instanceof ApiError && (error.status === 401 || error.errorCode === 2008)) {
      await clearAuthSession();
      const res = NextResponse.json(
        {
          success: false,
          sessionExpired: true,
          errorCode: error.errorCode || 2008,
          errorMessage: error.message,
        },
        { status: 401 }
      );
      res.cookies.delete(ACCESS_TOKEN_COOKIE);
      res.cookies.delete(REFRESH_TOKEN_COOKIE);
      res.cookies.delete(USER_PROFILE_COOKIE);
      return res;
    }

    return NextResponse.json(
      {
        success: false,
        errorMessage:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while changing password.",
      },
      { status: 400 }
    );
  }
}

