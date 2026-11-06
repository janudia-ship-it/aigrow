"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { LoginFormData, SignupFormData } from "../schemas/auth.schema";
import { AuthErrorCode } from "../types/auth.types";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const router = useRouter();
  const tAuth = useTranslations("auth");

  const getTranslatedErrorMessage = (errorCode: number, defaultMsg?: string) => {
    switch (errorCode) {
      case AuthErrorCode.INVALID_CLIENT_TYPE:
        return tAuth("errors.invalidClient");
      case AuthErrorCode.WRONG_CREDENTIALS:
        return tAuth("errors.wrongCredentials");
      case AuthErrorCode.ACCOUNT_DEACTIVATED:
        return tAuth("errors.deactivated");
      case AuthErrorCode.EMAIL_NOT_VERIFIED:
        return tAuth("errors.emailNotVerified");
      case AuthErrorCode.RATE_LIMIT_EXCEEDED:
        return tAuth("errors.rateLimit");
      default:
        return defaultMsg || tAuth("errors.genericError");
    }
  };

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setErrorCode(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: data.userName,
          password: data.password,
          clientType: "Web",
          rememberMe: data.rememberMe,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const message = getTranslatedErrorMessage(
          result.errorCode,
          result.errorMessage
        );
        setErrorMessage(message);
        setErrorCode(result.errorCode ?? null);
        return false;
      }

      // Successful login -> Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
      return true;
    } catch {
      setErrorMessage(tAuth("errors.networkError"));
      setErrorCode(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (values: SignupFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let response: Response;

      if (values.profilePicture instanceof File) {
        const formData = new FormData();
        formData.append("firstName", values.firstName);
        formData.append("lastName", values.lastName);
        formData.append("userName", values.userName);
        formData.append("email", values.email);
        formData.append("password", values.password);
        formData.append("confirmPassword", values.confirmPassword);
        formData.append("countryCode", values.countryCode);
        if (values.country) formData.append("country", values.country);
        if (values.phoneNumber) formData.append("phoneNumber", values.phoneNumber);
        if (values.address) formData.append("address", values.address);
        formData.append(
          "profilePicture",
          values.profilePicture,
          values.profilePicture.name
        );
        formData.append("agreeToTerms", String(values.agreeToTerms));

        response = await fetch("/api/auth/signup", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      }

      const data = await response.json();

      if (!response.ok || (data && !data.success)) {
        throw new Error(data.message || data.errorMessage || "Signup failed");
      }

      router.push(
        `/verify-email?email=${encodeURIComponent(values.email)}&userName=${encodeURIComponent(values.userName)}`
      );
      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    signup,
    isLoading,
    errorMessage,
    setErrorMessage,
    errorCode,
    setErrorCode,
  };
}
