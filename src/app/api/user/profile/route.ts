import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, USER_PROFILE_COOKIE } from "@/lib/auth/session";
import { profileDetailsSchema } from "@/features/profile/schemas/profile.schema";
import { updateProfileApi } from "@/features/profile/services/profile-api";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const validation = profileDetailsSchema.safeParse(body);

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

    let updatedUser;
    try {
      const result = await updateProfileApi(validation.data, accessToken);
      updatedUser = result.user;
    } catch (backendError) {
      console.error("Backend updateProfileApi error:", backendError);
      return NextResponse.json(
        {
          success: false,
          errorMessage:
            backendError instanceof Error
              ? backendError.message
              : "Failed to update profile on backend.",
        },
        { status: 400 }
      );
    }

    if (updatedUser) {
      const existingUserStr = cookieStore.get(USER_PROFILE_COOKIE)?.value;
      let mergedUser = updatedUser;
      if (existingUserStr) {
        try {
          const parsed = JSON.parse(existingUserStr);
          mergedUser = {
            ...parsed,
            ...updatedUser,
          };
        } catch {
          mergedUser = updatedUser;
        }
      }

      cookieStore.set(USER_PROFILE_COOKIE, JSON.stringify(mergedUser), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      updatedUser = mergedUser;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully.",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile route error:", error);
    return NextResponse.json(
      {
        success: false,
        errorMessage:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while updating profile.",
      },
      { status: 400 }
    );
  }
}

