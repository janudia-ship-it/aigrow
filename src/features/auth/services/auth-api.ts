import { ApiError } from "@/lib/api/api-error";
import type {
  LoginApiResponse,
  LoginCredentials,
  AuthResponse,
  SignupApiResponse,
  SignupCredentials,
  ResendOtpRequest,
  ResendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "../types/auth.types";
import { BACKEND_URL } from "@/lib/api/api-config";
// const BACKEND_URL =
//   process.env.API_BASE_URL ||
//   process.env.NEXT_PUBLIC_API_URL ||
//   "http://172.16.20.58:81";

const COUNTRY_BY_DIALING_CODE: Record<string, string> = {
  "+1": "US",
  "+44": "UK",
  "+61": "AU",
  "+91": "IN",
  "+94": "LK",
  "+971": "AE",
};

// function getCountryFromDialingCode(countryCode: string): string {
//   const country = COUNTRY_BY_DIALING_CODE[countryCode];
//   if (!country) {
//     throw new ApiError("Unsupported country calling code.", 400, 400);
//   }
//   return country;
// }

export async function loginUser(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  const url = `${BACKEND_URL}/api/v1/auth/login`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: credentials.userName,
        password: credentials.password,
        clientType: credentials.clientType || "Web",
      }),
      // Don't cache auth requests
      cache: "no-store",
    });

    if (response.status === 429) {
      throw new ApiError(
        "Too many requests. Please wait a minute before trying again.",
        4003,
        429
      );
    }

    let result: LoginApiResponse;
    try {
      result = await response.json();
    } catch {
      throw new ApiError(
        "Invalid response received from server.",
        500,
        response.status
      );
    }

    if (!result.success || result.errorCode !== 0 || !result.data) {
      const message =
        result.errorMessage ||
        result.message ||
        "Login failed. Please check your credentials.";
      throw new ApiError(message, result.errorCode, response.status);
    }

    return result.data;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "Failed to connect to authentication server";
    throw new ApiError(message, 0, 500);
  }
}

export async function signupUser(
  credentials: SignupCredentials
): Promise<SignupApiResponse> {
  const url = `${BACKEND_URL}/api/v1/auth/register`;

  try {
    const formData = new FormData();
    formData.append("FirstName", credentials.firstName.trim());
    formData.append("LastName", credentials.lastName.trim());
    formData.append("UserName", credentials.userName.trim());
    formData.append("Email", credentials.email.trim());
    formData.append("Password", credentials.password);

    if (credentials.phoneNumber && credentials.phoneNumber.trim()) {
      const cleanPhone = credentials.phoneNumber.trim();
      const fullPhone =
        cleanPhone.startsWith("+") || !credentials.countryCode
          ? cleanPhone
          : `${credentials.countryCode}${cleanPhone.replace(/^0+/, "")}`;
      formData.append("PhoneNumber", fullPhone);
    }

    const country =
      credentials.country?.trim() ||
      (credentials.countryCode
        ? COUNTRY_BY_DIALING_CODE[credentials.countryCode] || credentials.countryCode
        : "");
    if (country) {
      formData.append("Country", country);
    }

    if (credentials.address && credentials.address.trim()) {
      formData.append("Address", credentials.address.trim());
    }

    if (
      credentials.profilePicture &&
      typeof (credentials.profilePicture as Blob).size === "number" &&
      (credentials.profilePicture as Blob).size > 0
    ) {
      const filename =
        (credentials.profilePicture as File).name || "profilePicture.png";
      formData.append("profilePicture", credentials.profilePicture, filename);
    }

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    if (response.status === 429) {
      throw new ApiError(
        "Too many requests. Please wait a minute before trying again.",
        4003,
        429
      );
    }

    let result: SignupApiResponse;
    try {
      result = await response.json();
    } catch {
      throw new ApiError(
        "Invalid response received from server.",
        500,
        response.status
      );
    }

    if (!response.ok || !result.success || result.errorCode !== 0) {
      throw new ApiError(
        result.errorMessage || result.message || "Signup failed.",
        result.errorCode,
        response.status
      );
    }

    return result;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to connect to authentication server";
    throw new ApiError(message, 0, 500);
  }
}
export const resendOtp = async (
  data: ResendOtpRequest
): Promise<ResendOtpResponse> => {
  const endpoints = [
    `${BACKEND_URL}/api/v1/auth/resend-verification`,
  ];
  let lastError: Error | null = null;

  const payload = {
    userName: data.userName || data.email,
    UserName: data.userName || data.email,
    username: data.userName || data.email,
    ...(data.email ? { email: data.email, Email: data.email } : {}),
  };

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      if (response.status === 404 && url !== endpoints[endpoints.length - 1]) {
        continue;
      }

      const result = await response.json().catch(() => ({}));

      if (!response.ok || (result && result.success === false)) {
        throw new Error(
          result.errorMessage || result.message || "Failed to resend verification code."
        );
      }

      return {
        message: result.message || "Verification code resent successfully.",
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (url === endpoints[endpoints.length - 1]) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error("Failed to resend verification code.");
};

export const verifyOtp = async (
  data: VerifyOtpRequest
): Promise<VerifyOtpResponse> => {
  const endpoints = [
    `${BACKEND_URL}/api/v1/auth/verify-email`,
  ];
  let lastError: Error | null = null;

  const payload = {
    userName: data.userName || data.email,
    UserName: data.userName || data.email,
    username: data.userName || data.email,
    ...(data.email ? { email: data.email, Email: data.email } : {}),
    otp: data.otp,
    Otp: data.otp,
    code: data.otp,
    Code: data.otp,
  };

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      if (response.status === 404 && url !== endpoints[endpoints.length - 1]) {
        continue;
      }

      const result = await response.json().catch(() => ({}));

      if (!response.ok || (result && result.success === false)) {
        throw new Error(
          result.errorMessage || result.message || "Email verification failed."
        );
      }

      return {
        message: result.message || "Email verified successfully.",
        verified: result.verified ?? (result.success ?? true),
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (url === endpoints[endpoints.length - 1]) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error("Email verification failed.");
};

export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
  const endpoints = [
    `${BACKEND_URL}/api/v1/auth/forgot-password`,
    // `${BACKEND_URL}/auth/forgot-password`,
  ];
  let lastError: Error | null = null;

  const payload = {
    email: data.email,
    Email: data.email,
    userName: data.email,
    UserName: data.email,
  };

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      if (response.status === 404 && url !== endpoints[endpoints.length - 1]) {
        continue;
      }

      const result = await response.json().catch(() => ({}));

      if (
        !response.ok ||
        (result && result.success === false) ||
        (result && result.errorCode !== undefined && result.errorCode !== 0)
      ) {
        throw new Error(
          result.errorMessage ||
          result.message ||
          "Unable to process forgot password request."
        );
      }

      return {
        errorCode: result.errorCode ?? 0,
        errorMessage: result.errorMessage ?? "",
        success: true,
        message:
          result.message ||
          "Password reset instructions have been sent to your email.",
        data: result.data ?? "",
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (url === endpoints[endpoints.length - 1]) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error("Unable to process forgot password request.");
};

export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const endpoints = [
    `${BACKEND_URL}/api/v1/auth/reset-password`,
    `${BACKEND_URL}/auth/reset-password`,
  ];
  let lastError: Error | null = null;

  const payload = {
    email: data.email.trim(),
    Email: data.email.trim(),
    code: data.code.trim(),
    Code: data.code.trim(),
    newPassword: data.newPassword,
    NewPassword: data.newPassword,
    newpassword: data.newPassword,
  };

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      if (response.status === 404 && url !== endpoints[endpoints.length - 1]) {
        continue;
      }

      const result = await response.json().catch(() => ({}));

      if (
        !response.ok ||
        (result && result.success === false) ||
        (result && result.errorCode !== undefined && result.errorCode !== 0)
      ) {
        throw new Error(
          result.errorMessage ||
          result.message ||
          "Unable to reset password. Please verify the code and try again."
        );
      }

      return {
        errorCode: result.errorCode ?? 0,
        errorMessage: result.errorMessage ?? "",
        success: true,
        message: result.message || "Password has been reset successfully.",
        data: result.data ?? null,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (url === endpoints[endpoints.length - 1]) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error("Unable to reset password. Please try again.");
};
