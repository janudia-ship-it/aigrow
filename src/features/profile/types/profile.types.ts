import type { UserProfile } from "@/features/auth/types/auth.types";

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  errorCode?: number;
  errorMessage?: string;
  message?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  country?: string | null;
  address?: string | null;
  profilePicture?: File | Blob | null;
  removeProfilePicture?: boolean;
  // Form fields from client UI:
  userName?: string;
  email?: string;
  countryCode?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  errorCode?: number;
  errorMessage?: string;
  message?: string;
  user?: UserProfile;
}


