"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Mail, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    forgotPasswordSchema,
    type ForgotPasswordFormData,
} from "../schemas/auth.schema";

export default function ForgotPasswordForm() {
    const t = useTranslations("auth");
    const router = useRouter();
    const [apiError, setApiError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setLoading(true);
        setApiError("");
        setSuccessMessage("");

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || !result.success) {
                throw new Error(
                    result.errorMessage ||
                    result.message ||
                    "Unable to send reset instructions."
                );
            }

            setSuccessMessage(
                result.message || "Verification code has been sent to your email."
            );

            // Display the success notification, then navigate to resetPassword
            setTimeout(() => {
                router.push(`/reset-password?email=${encodeURIComponent(data.email.trim())}`);
            }, 1500);
        } catch (error) {
            setApiError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
            );
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <img
                src="/Images/bg.png"
                alt=""
                className="z-1 pointer-events-none absolute bottom-0 right-0 h-auto w-[400px] object-contain "
            />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-2">
                <div className="relative z-10 flex w-full max-w-[500px] flex-col items-center justify-center rounded-[25px] border border-primary bg-card px-8 py-4 shadow-lg">
                    {/* Icon and Heading */}
                    <div className="mb-6 flex flex-col items-center justify-center gap-1 text-center">
                        <img
                            src="/Images/forgotPassword-Icon.png"
                            alt="Forgot Password"
                            className="h-50 w-50 object-contain"
                        />

                        <h1 className="text-2xl font-bold text-primary">
                            Forgot Password
                        </h1>
                        <p className="text-sm text-hint">
                            No worries! Enter your email address and we’ll send you a reset code.
                        </p>
                    </div>

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
                        <div className="space-y-1">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                startIcon={<Mail className="w-4 h-4 text-[var(--text-hint)]" />}
                                endIcon={<span className="text-[var(--color-error)] text-xs font-bold mr-1">*</span>}
                                error={!!errors.email}
                                disabled={loading}
                                autoComplete="email"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500 pl-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !!successMessage}
                            className="w-full"
                        >
                            {loading && !successMessage ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </span>
                            ) : successMessage ? (
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Redirecting...
                                </span>
                            ) : (
                                "Send Reset Code"
                            )}
                        </Button>

                        <div className="pt-2 text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:underline transition-colors"
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
