import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";
import { changePasswordSchema } from "@/features/profile/schemas/profile.schema";
import { changePasswordApi } from "@/features/profile/services/profile-api";

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

