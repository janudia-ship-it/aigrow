import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "../types/profile.types";

const BACKEND_URL =
  process.env.INTERNAL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://172.16.20.58:81";

export async function changePasswordApi(
  data: ChangePasswordRequest,
  accessToken?: string | null
): Promise<ChangePasswordResponse> {
  const url = `${BACKEND_URL}/api/v1/auth/change-password`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const payload = {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
    newpassword: data.newPassword,
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || (result && result.success === false)) {
    throw new Error(
      result.errorMessage ||
        result.message ||
        "Failed to change password. Please verify current password and try again."
    );
  }

  return {
    success: true,
    message: result.message || "Password updated successfully.",
    errorCode: result.errorCode ?? 0,
  };
}

export async function updateProfileApi(
  data: UpdateProfileRequest,
  accessToken?: string | null
): Promise<UpdateProfileResponse> {
  const url = `${BACKEND_URL}/api/v1/user/profile`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || (result && result.success === false)) {
    // If backend profile update endpoint isn't ready or returns error, return message
    throw new Error(
      result.errorMessage ||
        result.message ||
        "Failed to update profile details."
    );
  }

  return {
    success: true,
    message: result.message || "Profile updated successfully.",
    user: result.data || result.user,
  };
}

