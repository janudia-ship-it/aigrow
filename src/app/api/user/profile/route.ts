import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, USER_PROFILE_COOKIE } from "@/lib/auth/session";
import { profileDetailsSchema } from "@/features/profile/schemas/profile.schema";
import { updateProfileApi } from "@/features/profile/services/profile-api";

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;

    const existingUserStr = cookieStore.get(USER_PROFILE_COOKIE)?.value;
    let existingUser: Record<string, any> | null = null;
    if (existingUserStr) {
      try {
        existingUser = JSON.parse(existingUserStr);
      } catch {
        existingUser = null;
      }
    }

    let payload: Record<string, any> = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const getStr = (key: string): string | undefined => {
        const val = formData.get(key);
        return typeof val === "string" ? val : undefined;
      };

      payload = {
        firstName: getStr("firstName") ?? existingUser?.firstName ?? "",
        lastName: getStr("lastName") ?? existingUser?.lastName ?? "",
        userName: getStr("userName") ?? existingUser?.userName ?? "",
        email: getStr("email") ?? existingUser?.email ?? "",
        countryCode: getStr("countryCode") ?? existingUser?.countryCode ?? "+94",
        country: getStr("country") ?? existingUser?.country ?? null,
        phoneNumber: getStr("phoneNumber") ?? existingUser?.phoneNumber ?? null,
        address: getStr("address") ?? existingUser?.address ?? null,
        removeProfilePicture: formData.get("removeProfilePicture") === "true",
      };

      const file = formData.get("profilePicture");
      if (
        file &&
        typeof file === "object" &&
        "size" in file &&
        (file as File).size > 0
      ) {
        payload.profilePicture = file as File;
      }
    } else {
      payload = await request.json().catch(() => ({}));
    }

    const validation = profileDetailsSchema.safeParse(payload);

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

