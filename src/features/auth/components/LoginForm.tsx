"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { User, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { loginSchema, type LoginFormData } from "../schemas/auth.schema";
import { useAuth } from "../hooks/use-auth";
import { AuthErrorCode } from "../types/auth.types";

export function LoginForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const isVerified = searchParams.get("verified") === "true";
  const isReset = searchParams.get("reset") === "true";
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, errorMessage, errorCode } = useAuth();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: searchParams.get("userName") || "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  return (
    <div className="w-full max-w-[600px] mx-auto flex flex-col justify-between min-h-[90vh] py-8 px-6 sm:px-8">
      {/* Top Header: Logo, Theme & Language Switcher */}
      <div className="flex items-center justify-between w-full mb-8">
        <div className="relative w-28 h-12">
          <Image
            src="/Aigrow-logo.png"
            alt="AiGrow Logo"
            fill
            sizes="120px"
            className="object-contain object-left"
            priority
          />
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center my-auto">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-heading)] leading-tight">
            {t("welcome")}
            <br />
            {t("welcomeBack")}
          </h1>
        </div>

        {/* Success notification after email verification */}
        {isVerified && !errorMessage && (
          <div
            role="status"
            className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">
                {t("emailVerifiedSuccess")}
              </p>
              <p className="text-xs opacity-90 mt-0.5">
                {t("pleaseLoginAgain")}
              </p>
            </div>
          </div>
        )}

        {/* Success notification after password reset */}
        {isReset && !errorMessage && !isVerified && (
          <div
            role="status"
            className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Password reset successfully!</p>
              <p className="text-xs opacity-90 mt-0.5">Please sign in with your new password.</p>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-[var(--color-danger-light)] border border-[var(--color-danger)]/20 flex items-start gap-2.5 text-xs sm:text-sm text-[var(--color-danger-dark)]"
          >
            <AlertCircle className="w-4 h-4 text-[var(--color-danger)] shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p>{errorMessage}</p>
              {errorCode === AuthErrorCode.EMAIL_NOT_VERIFIED && (
                <div>
                  <Link
                    href={`/verify-email?userName=${encodeURIComponent(
                      getValues("userName")?.trim() || ""
                    )}&email=${encodeURIComponent(
                      getValues("userName")?.trim() || ""
                    )}`}
                    className="font-semibold underline text-red-600 hover:underline inline-flex items-center gap-1 transition-colors"
                  >
                    {t("verifyNow")} &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email / Username field */}
          <div className="space-y-1">
            <Input
              type="text"
              placeholder={t("userNamePlaceholder")}
              startIcon={<User className="w-5 h-5 text-[var(--text-hint)]" />}
              error={!!errors.userName}
              disabled={isLoading}
              autoComplete="username"
              {...register("userName")}
            />
            {errors.userName && (
              <p className="text-xs text-[var(--color-error)] pl-1">
                {errors.userName.message === "usernameRequired"
                  ? t("validation.usernameRequired")
                  : errors.userName.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              startIcon={<Lock className="w-5 h-5 text-[var(--text-hint)]" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 rounded-md text-[var(--text-hint)] hover:text-[var(--foreground)] focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
              error={!!errors.password}
              disabled={isLoading}
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-[var(--color-error)] pl-1">
                {errors.password.message === "passwordRequired"
                  ? t("validation.passwordRequired")
                  : errors.password.message}
              </p>
            )}
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between pt-1 pb-2">
            <Checkbox
              id="remember-me"
              label={t("remember")}
              disabled={isLoading}
              {...register("rememberMe")}
            />
            <Link
              href="/forgot-password"
              className="text-xs sm:text-sm font-medium text-[var(--color-link)] dark:text-[var(--color-accent-mint)] hover:text-[var(--color-link-hover)] hover:underline transition-colors"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            variant="default"
            shape="pill"
            size="default"
            className="w-full font-semibold text-sm tracking-wide shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("signingIn")}
              </span>
            ) : (
              t("signIn")
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-outline-light)] dark:border-[var(--color-outline-dark)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--background)] px-3 text-[var(--color-text-hint-light)] dark:text-[var(--color-text-hint-dark)] font-normal">
              {t("or")}
            </span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <Button
          type="button"
          variant="outline"
          shape="pill"
          size="default"
          className="w-full flex items-center justify-center gap-3 text-sm font-semibold border-[var(--color-google-border)] dark:border-[var(--color-outline-dark)] bg-[var(--surface)] hover:bg-[var(--color-google-hover)] dark:hover:bg-[var(--color-surface-dark)] text-[var(--foreground)] shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{t("signInWithGoogle")}</span>
        </Button>
      </div>

      {/* Footer link: Don't have an account? SignUp */}
      <div className="pt-8 text-center text-xs sm:text-sm text-[var(--text-hint)]">
        {t("noAccount")}{" "}
        <Link
          href="/signup"
          className="font-bold text-[var(--color-primary)] dark:text-[var(--color-accent-mint)] hover:text-[var(--color-link-hover)] hover:underline ml-1 transition-colors"
        >
          {t("signUp")}
        </Link>
      </div>
    </div>
  );
}

