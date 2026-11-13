import type { UserProfile } from "@/features/auth/types/auth.types";
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "../types/profile.types";
import { BACKEND_URL } from "@/lib/api/api-config";
import { ApiError } from "@/lib/api/api-error";

export async function getMyProfileApi(
  accessToken?: string | null
): Promise<UserProfile> {
  const url = `${BACKEND_URL}/api/v1/auth/me`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || (result && result.success === false)) {
    throw new ApiError(
      result.errorMessage || result.message || "Failed to fetch profile.",
      result.errorCode || (response.status === 401 ? 2008 : 0),
      response.status
    );
  }

  return result.data;
}

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
    throw new ApiError(
      result.errorMessage ||
      result.message ||
      "Failed to change password. Please verify current password and try again.",
      result.errorCode || (response.status === 401 ? 2008 : 0),
      response.status
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
  const url = `${BACKEND_URL}/api/v1/auth/me`;

  // Note: Do NOT set Content-Type header when sending FormData;
  // fetch will automatically set it along with the multipart boundary.
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const formData = new FormData();
  formData.append("firstName", (data.firstName || "").trim());
  formData.append("lastName", (data.lastName || "").trim());

  if (data.phoneNumber && data.phoneNumber.trim() !== "") {
    formData.append("phoneNumber", data.phoneNumber.trim());
    // country is required by backend when phoneNumber is sent
    const country = (data.country || "LK").trim().toUpperCase();
    formData.append("country", country);
  } else if (data.country && data.country.trim() !== "") {
    formData.append("country", data.country.trim().toUpperCase());
  }

  if (data.address && data.address.trim() !== "") {
    formData.append("address", data.address.trim());
  }

  if (typeof data.removeProfilePicture === "boolean") {
    formData.append("removeProfilePicture", String(data.removeProfilePicture));
  }

  if (data.profilePicture) {
    const filename = (data.profilePicture as File).name || "profilePicture.png";
    formData.append("profilePicture", data.profilePicture, filename);
  }

  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: formData,
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || (result && result.success === false)) {
    throw new ApiError(
      result.errorMessage ||
      result.message ||
      `Failed to update profile details (${response.status}).`,
      result.errorCode || (response.status === 401 ? 2008 : 0),
      response.status
    );
  }

  return {
    success: true,
    message: result.message || "Profile updated successfully.",
    errorCode: result.errorCode ?? 0,
    user: result.data || result.user,
  };
}

