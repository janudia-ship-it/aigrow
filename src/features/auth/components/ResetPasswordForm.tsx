"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Lock,
    Eye,
    EyeOff,
    Mail,
    KeyRound,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    Loader2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    resetPasswordSchema,
    type ResetPasswordFormData,
} from "../schemas/auth.schema";
import OtpInput from "./OtpInput";
import ResendOtp from "./ResendOtp";
import { useTranslations } from "next-intl";

export default function ResetPasswordForm() {
    const t = useTranslations("auth");
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email") || "";

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [apiError, setApiError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        clearErrors,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: emailParam,
            code: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const codeValue = watch("code") || "";

    // Keep email updated in form state if searchParams change
    useEffect(() => {
        if (emailParam) {
            setValue("email", emailParam);
        }
    }, [emailParam, setValue]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        setLoading(true);
        setApiError("");
        setSuccessMessage("");

        const emailToSubmit = data.email || emailParam;

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: emailToSubmit.trim(),
                    code: data.code.trim(),
                    newPassword: data.newPassword,
                    newpassword: data.newPassword,
                    confirmPassword: data.confirmPassword,
                }),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || !result.success) {
                throw new Error(
                    result.errorMessage ||
                    result.message ||
                    "Failed to reset password. Please verify the code and try again."
                );
            }

            setSuccessMessage(
                result.message || "Password reset successfully! Redirecting to login..."
            );

            // Redirect to login page after a brief delay
            setTimeout(() => {
                router.push("/login?reset=true");
            }, 1200);
        } catch (error) {
            setApiError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        const targetEmail = emailParam.trim() || watch("email")?.trim();

        if (!targetEmail) {
            throw new Error("Please enter your email to resend the code.");
        }

        const response = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: targetEmail }),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(
                result.errorMessage ||
                result.message ||
                "Unable to resend verification code."
            );
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-4">
            <img
                src="/Images/bg.png"
                alt=""
                className="pointer-events-none absolute bottom-0 right-0 h-auto w-[400px] object-contain"
            />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
                <div className="relative z-10 flex w-full max-w-[500px] flex-col items-center justify-center rounded-[25px] border border-primary bg-card p-8 shadow-lg">
                    {/* Header */}
                    <div className="mb-6 flex flex-col items-center justify-center gap-3 text-center">
                        <div className="flex items-center justify-center rounded-bg-gradient-to-br from-primary to-primary/50 full">
                            <img
                                src="/Images/resent_link.png"
                                alt=""
                                className="h-35 w-35 object-contain mb-1"
                            />
                        </div>

                        <h1 className="text-2xl font-bold text-primary">
                            Reset Password
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter the verification code sent to your email and create a new password.
                        </p>
                    </div>

                    {/* Email banner if passed from forgot-password */}
                    {emailParam && (
                        <div className="mb-4 w-full flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs sm:text-sm text-primary">
                            <Mail className="w-4 h-4 shrink-0" />
                            <span className="truncate">
                                Code sent to: <strong>{emailParam}</strong>
                            </span>
                        </div>
                    )}

                    {/* Success notification */}
                    {successMessage && (
                        <div
                            role="status"
                            className="mb-5 w-full p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200"
                        >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Error notification */}
                    {apiError && (
                        <div
                            role="alert"
                            className="mb-5 w-full p-3.5 rounded-xl bg-[var(--color-danger-light)] border border-[var(--color-danger)]/20 flex items-start gap-2.5 text-xs sm:text-sm text-[var(--color-danger-dark)]"
                        >
                            <AlertCircle className="w-4 h-4 text-[var(--color-danger)] shrink-0 mt-0.5" />
                            <span>{apiError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
                        {/* If email is NOT passed in URL, allow user to input email */}
                        {!emailParam ? (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-foreground">
                                    Email Address <span className="text-[var(--color-error)]">*</span>
                                </label>
                                <div className="mt-2">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        startIcon={<Mail className="w-4 h-4 text-[var(--text-hint)]" />}
                                        error={!!errors.email}
                                        disabled={loading}
                                        autoComplete="email"
                                        {...register("email")}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-500 pl-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <input type="hidden" {...register("email")} value={emailParam} />
                        )}

                        {/* Verification Code */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">
                                Verification Code <span className="text-[var(--color-error)]">*</span>
                            </label>

                            <div className="mt-2">
                                <OtpInput
                                    length={6}
                                    value={codeValue}
                                    onChange={(value) => {
                                        setValue("code", value, { shouldValidate: true });
                                        if (errors.code) {
                                            clearErrors("code");
                                        }
                                    }}
                                    error={errors.code?.message}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">
                                New Password <span className="text-[var(--color-error)]">*</span>
                            </label>
                            <div className="mt-2">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your new password"
                                    startIcon={<Lock className="w-4 h-4 text-[var(--text-hint)]" />}
                                    endIcon={
                                        <div className="flex items-center gap-1.5">
                                            {/* <span className="text-[var(--color-error)] text-xs font-bold mr-1">*</span> */}
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
                                    error={!!errors.newPassword}
                                    disabled={loading}
                                    autoComplete="new-password"
                                    {...register("newPassword")}
                                />
                            </div>
                            {errors.newPassword && (
                                <p className="text-xs text-red-500 pl-1">
                                    {errors.newPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">
                                Confirm Password <span className="text-[var(--color-error)]">*</span>
                            </label>
                            <div className="mt-2">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Enter your confirm password"
                                    startIcon={<Lock className="w-4 h-4 text-[var(--text-hint)]" />}
                                    endIcon={
                                        <div className="flex items-center gap-1.5">
                                            {/* <span className="text-[var(--color-error)] text-xs font-bold mr-1">*</span> */}
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
                                    disabled={loading}
                                    autoComplete="new-password"
                                    {...register("confirmPassword")}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500 pl-1">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Resetting Password...
                                </span>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>

                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--color-outline-light)] dark:border-[var(--color-outline-dark)]" />
                            </div>
                        </div>

                        <div className="pt-1">
                            <ResendOtp
                                onResend={handleResendOtp}
                                initialSeconds={30}
                                disabled={loading}
                            />
                        </div>

                        <div className="flex items-center justify-center pt-2 text-xs sm:text-sm">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline transition-colors"
                            >
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}