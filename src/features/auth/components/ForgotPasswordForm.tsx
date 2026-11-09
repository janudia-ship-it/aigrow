"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Mail, AlertCircle, Loader2 } from "lucide-react";
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

            // Navigate immediately to reset-password with the email
            router.push(`/reset-password?email=${encodeURIComponent(data.email.trim())}`);
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
        <div className="w-full gap-3 mb-2">
            <img
                src="/Images/bg.png"
                alt=""
                className="z-1 pointer-events-none absolute bottom-0 right-0 h-auto w-[400px] object-contain "
            />
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-4 ">
                <div className="relative z-10 flex w-full max-w-[500px] flex-col items-center justify-center rounded-[25px] border border-primary bg-card px-8 py-4 shadow-lg">
                    {/* Icon and Heading */}
                    <div className="mb-6 flex flex-col items-center justify-center gap-1 text-center">
                        <img
                            src="/Images/forgotPassword-Icon.png"
                            alt="Forgot Password"
                            className="h-50 w-50 object-contain mb-1"
                        />

                        <h1 className="text-2xl text-center font-bold tracking-light text-primary">
                            Forgot Password
                        </h1>
                        <p className="text-sm text-hint">
                            No worries! Enter your email address and we’ll send you a reset code.
                        </p>
                    </div>

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
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </span>
                            ) : (
                                "Send Reset Code"
                            )}
                        </Button>

                        <div className="pt-2 text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:underline transition-colors"
                            >  Back to Sign In
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
