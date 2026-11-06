export interface UserProfile {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  country: string | null;
  address: string | null;
  role: string;
  profilePictureUrl: string | null;
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: UserProfile;
}

export interface LoginApiResponse {
  errorCode: number;
  errorMessage: string | null;
  success: boolean;
  message: string | null;
  data: AuthResponse | null;
}

export interface LoginCredentials {
  userName: string;
  password: string;
  clientType?: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  countryCode?: string;
  country?: string;
  phoneNumber?: string;
  address?: string;
  profilePicture?: File | Blob | null;
  agreeToTerms?: boolean;
}
export interface SignupApiResponse {
  errorCode: number;
  errorMessage: string | null;
  success: boolean;
  message: string | null;
  data: AuthResponse | null;
}

export interface ResendOtpRequest {
  userName?: string;
  email?: string;
}

export interface ResendOtpResponse {
  message: string;
}

export interface VerifyOtpRequest {
  userName?: string;
  email?: string;
  otp: string;
  code?: string;
}

export interface VerifyOtpResponse {
  message: string;
  verified: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  errorCode: number;
  errorMessage: string;
  success: boolean;
  message: string;
  data: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  errorCode: number;
  errorMessage: string;
  success: boolean;
  message: string;
  data: string | null;
}

export enum AuthErrorCode {
  INVALID_CLIENT_TYPE = 1000,
  WRONG_CREDENTIALS = 2003,
  ACCOUNT_DEACTIVATED = 2005,
  EMAIL_NOT_VERIFIED = 2007,
  SESSION_EXPIRED_OTHER_DEVICE = 2008,
  RATE_LIMIT_EXCEEDED = 4003,
}
