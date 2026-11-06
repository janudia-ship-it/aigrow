"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useTranslations } from "next-intl";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  BookOpen,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { signupSchema, type SignupFormData } from "../schemas/auth.schema";
import { useAuth } from "../hooks/use-auth";
import {
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input";


const COUNTRY_CODES = getCountries()
  .map((country) => {
    const code = `+${getCountryCallingCode(country)}`;
    return {
      code,
      label: `${country} (${code})`,
      country,
    };
  })
  .sort((a, b) => {
    if (a.country === "LK") return -1;
    if (b.country === "LK") return 1;
    return a.country.localeCompare(b.country);
  });

export function SignupForm() {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, errorMessage } = useAuth();

  const {
    //Connects input fields to React Hook Form.
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof signupSchema>, any, SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      countryCode: "+94",
      country: "LK",
      phoneNumber: "",
      address: "",
      profilePicture: null,
      agreeToTerms: true,
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const selectedCountry = COUNTRY_CODES.find((c) => c.code === data.countryCode)?.country;
      await signup({
        ...data,
        country: selectedCountry || data.country || "LK",
        profilePicture: null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

const getErrorMessage = (errorKey?: string) => {
  if (!errorKey) return "";
  switch (errorKey) {
    case "firstNameRequired":
      return t("validation.firstNameRequired");
    case "lastNameRequired":
      return t("validation.lastNameRequired");
    case "usernameRequired":
      return t("validation.usernameRequired");
    case "emailRequired":
      return t("validation.emailRequired");
    case "invalidEmail":
      return t("validation.invalidEmail");
    case "passwordMinLength":
      return t("validation.passwordMinLength");
    case "confirmPasswordRequired":
      return t("validation.confirmPasswordRequired");
    case "passwordsDoNotMatch":
      return t("validation.passwordsDoNotMatch");
    case "phoneRequired":
      return t("validation.phoneRequired");
    case "termsRequired":
      return t("validation.termsRequired");
    default:
      return errorKey;
  }
};

return (
  <div className="w-full max-w-[500px] mx-auto flex flex-col justify-between py-6 px-4 sm:px-6">
    {/* Top Controls: Switchers */}
    <div className="flex items-center justify-end gap-2 w-full mb-3">
      <ThemeSwitcher />
      <LanguageSwitcher />
    </div>

    {/* Header with Logo and Title */}
    <div className="flex flex-col items-center justify-center text-center mb-6">
      <div className="relative w-32 h-14 mb-2">
        <Image
          src="/Aigrow-logo.png"
          alt="AiGrow Logo"
          fill
          sizes="140px"
          className="object-contain"
          priority
        />
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-heading)]">
        {t("createAccount")}
      </h1>
    </div>

    {errorMessage && (
      <div
        role="alert"
        className="mb-5 p-3 rounded-xl bg-[var(--color-danger-light)] border border-[var(--color-danger)]/20 flex items-start gap-2.5 text-xs sm:text-sm text-[var(--color-danger-dark)]"
      >
        <AlertCircle className="w-4 h-4 text-[var(--color-danger)] shrink-0 mt-0.5" />
        <span>{errorMessage}</span>
      </div>
    )}

    {/* Signup Form */}
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      {/* Row 1: First Name & Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Input
            type="text"
            placeholder={t("firstName")}
            startIcon={<User className="w-4 h-4 text-[var(--text-hint)]" />}
            endIcon={<span className="text-[var(--color-error)] text-xs font-bold mr-1">*</span>}
            error={!!errors.firstName}
            disabled={isSubmitting}
            autoComplete="given-name"
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-xs text-[var(--color-error)] pl-1">
              {getErrorMessage(errors.firstName.message)}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Input
            type="text"
            placeholder={t("lastName")}
            startIcon={<User className="w-4 h-4 text-[var(--text-hint)]" />}
            endIcon={<span className="text-[var(--color-error)] text-xs font-bold mr-1">*</span>}
            error={!!errors.lastName}
            disabled={isSubmitting}
            autoComplete="family-name"
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-xs text-[var(--color-error)] pl-1">
              {getErrorMessage(errors.lastName.message)}
            </p>
          )}
        </div>
      </div>

      {/* User name */}
      <div className="space-y-1">
        <Input
          type="text"
          placeholder={t("userName")}
          startIcon={<User className="w-4 h-4 text-[var(--text-hint)]" />}
          endIcon={<span className="text-[var(--color-error)] text-xs font-bold mr-1">*</span>}
          error={!!errors.userName}
          disabled={isSubmitting}
          autoComplete="username"
          {...register("userName")}
        />
        {errors.userName && (
          <p className="text-xs text-[var(--color-error)] pl-1">
            {getErrorMessage(errors.userName.message)}
          </p>
        )}
      </div>

      {/* Email Address */}
      <div className="space-y-1">
        <Input
          type="email"
          placeholder={t("emailAddress")}
          startIcon={<Mail className="w-4 h-4 text-[var(--text-hint)]" />}
          endIcon={<span className="text-[var(--color-error)] text-xs font-bold mr-1">*</span>}
          error={!!errors.email}
          disabled={isSubmitting}
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-[var(--color-error)] pl-1">
            {getErrorMessage(errors.email.message)}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={t("password")}
          startIcon={<Lock className="w-4 h-4 text-[var(--text-hint)]" />}
          endIcon={
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--color-error)] text-xs font-bold">*</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded-md text-[var(--text-hint)] hover:text-[var(--foreground)] focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          }
          error={!!errors.password}
          disabled={isSubmitting}
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-[var(--color-error)] pl-1">
            {getErrorMessage(errors.password.message)}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <Input
          type={showConfirmPassword ? "text" : "password"}
          placeholder={t("confirmPassword")}
          startIcon={<Lock className="w-4 h-4 text-[var(--text-hint)]" />}
          endIcon={
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--color-error)] text-xs font-bold">*</span>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-1 rounded-md text-[var(--text-hint)] hover:text-[var(--foreground)] focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          }
          error={!!errors.confirmPassword}
          disabled={isSubmitting}
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-[var(--color-error)] pl-1">
            {getErrorMessage(errors.confirmPassword.message)}
          </p>
        )}
      </div>

      {/* Phone Number with Country Code */}
      <div className="space-y-1">
        <div className="flex gap-2.5">
          {/* Country code pill */}
          <div className="relative flex items-center shrink-0 w-[115px] sm:w-[125px]">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[var(--text-hint)]">
              <Phone className="w-4 h-4" />
            </div>
            <select
              aria-label="Country Code"
              disabled={isSubmitting}
              className="h-12 w-full appearance-none rounded-xl bg-[var(--input-fill)] pl-9 pr-7 py-3 text-sm font-medium text-[var(--foreground)] border border-[var(--input-border)] hover:border-[var(--border)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] shadow-[var(--shadow-input)] cursor-pointer"
              {...register("countryCode", {
                onChange: (e) => {
                  const match = COUNTRY_CODES.find((c) => c.code === e.target.value);
                  if (match) {
                    setValue("country", match.country);
                  }
                },
              })}
            >
              {COUNTRY_CODES.map((item) => (
                <option key={item.country} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 w-4 h-4 text-[var(--text-hint)] pointer-events-none" />
          </div>

          {/* Phone Number Input */}
          <div className="flex-1">
            <Input
              type="tel"
              placeholder={t("phoneNumber")}
              endIcon={<span className="text-[var(--color-error)] text-xs font-bold mr-1">*</span>}
              error={!!errors.phoneNumber}
              disabled={isSubmitting}
              autoComplete="tel"
              {...register("phoneNumber")}
            />
          </div>
        </div>
        {errors.phoneNumber && (
          <p className="text-xs text-[var(--color-error)] pl-1">
            {getErrorMessage(errors.phoneNumber.message)}
          </p>
        )}
      </div>

        {/* Your Address (Optional) */}
        <div className="space-y-1">
          <Input
            type="text"
            placeholder={t("addressOptional")}
            startIcon={<BookOpen className="w-4 h-4 text-[var(--text-hint)]" />}
            disabled={isSubmitting}
            autoComplete="street-address"
            {...register("address")}
          />
        </div>

        {/* Terms of Services & Privacy Policy Checkbox */}
        <div className="pt-1.5 pb-2">
          <div className="flex items-start gap-2.5 select-none">
            <Checkbox
              id="agree-terms"
              disabled={isSubmitting}
              {...register("agreeToTerms")}
            />
            <label
              htmlFor="agree-terms"
              className="text-xs sm:text-sm text-[var(--foreground)] leading-snug cursor-pointer pt-0.5"
            >
              {t("agreeTerms")}{" "}
              <Link
                href="/terms"
                className="underline font-medium text-[var(--color-link)] dark:text-[var(--color-accent-mint)] hover:text-[var(--color-link-hover)] transition-colors"
              >
                {t("termsOfServices")}
              </Link>{" "}
              {t("and")}{" "}
              <Link
                href="/privacy"
                className="underline font-medium text-[var(--color-link)] dark:text-[var(--color-accent-mint)] hover:text-[var(--color-link-hover)] transition-colors"
              >
                {t("privacyPolicy")}
              </Link>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-xs text-[var(--color-error)] pl-6 mt-1">
              {getErrorMessage(errors.agreeToTerms.message)}
            </p>
          )}
        </div>

        {/* Create Account Button */}
        <Button
          type="submit"
          variant="default"
          shape="pill"
          size="default"
          className="w-full font-semibold text-sm tracking-wide shadow-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("creatingAccount")}
            </span>
          ) : (
            t("createAccount")
          )}
        </Button>
    </form>

    {/* Footer Link: Already have an account? Sign In */}
    <div className="pt-6 pb-2 text-center text-xs sm:text-sm text-[var(--text-hint)]">
      {t("haveAccount")}{" "}
      <Link
        href="/login"
        className="font-bold text-[var(--color-primary)] dark:text-[var(--color-accent-mint)] hover:text-[var(--color-link-hover)] hover:underline ml-1 transition-colors"
      >
        {t("signIn")}
      </Link>
    </div>
  </div>
);
}
