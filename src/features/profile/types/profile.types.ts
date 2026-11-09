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
  userName: string;
  email: string;
  countryCode?: string;
  country?: string;
  phoneNumber?: string;
  address?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  errorCode?: number;
  errorMessage?: string;
  message?: string;
  user?: import("@/features/auth/types/auth.types").UserProfile;
}

