"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OtpInput from "./OtpInput";
import ResendOtp from "./ResendOtp";
import { useOtpVerification } from "../hooks/useOtpVerification";

export function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "your email address";
    const userName = searchParams.get("userName") || "";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");

    const {
        isVerifying,
        isVerified,
        errorMessage,
        handleResendOtp,
        handleVerifyOtp,
    } = useOtpVerification({ email, userName });

    const handleSubmit = async () => {
        if (otp.length !== 6) return;

        const success = await handleVerifyOtp(otp);

        if (success) {
            const redirectUrl = `/login?verified=true${userName
                ? `&userName=${encodeURIComponent(userName)}`
                : email && email !== "your email address"
                    ? `&userName=${encodeURIComponent(email)}`
                    : ""
                }`;
            router.push(redirectUrl);
        }
    };

    const handleResend = async () => {
        await handleResendOtp();
        setOtp("");
        setError("");
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-4">
            <img
                src="/Images/g.png"
                alt=""
                className="pointer-events-none absolute bottom-0 right-0 h-auto w-[400px] object-contain"
            />
            <div className="relative z-10 h-[600px] w-full max-w-[500px] rounded-[25px] bg-card p-8 border border-primary shadow-lg ">
                <div className="mb-4 flex justify-center">
                    <div className="flex items-center justify-center rounded-bg-gradient-to-br from-primary to-primary/50 full ">
                        {/* <MailCheck size={70} strokeWidth={1.5} className="text-primary-foreground" /> */}
                        <img src="/Images/Email verify.png" className="w-50 h-40" />
                    </div>
                </div>
                <h1 className="text-2xl text-center font-semibold tracking-light text-primary">Verify your email</h1>
                <p className="text-hint text-center text-sm mt-2 ">
                    We’ve sent a verification email to <br />
                    <span className="text-primary font-semibold">{email}</span>.
                    <br />
                    If you don’t see it, please check your spam folder
                </p>
                <div className="mt-6">
                    <OtpInput
                        length={6}
                        value={otp}
                        onChange={(value) => {
                            setOtp(value);
                            setError("");
                        }}
                        error={error || errorMessage}
                    />
                    <br />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={otp.length !== 6 || isVerifying}
                        className="w-full rounded-lg bg-primary
                        py-3 font-semibold text-white
                        hover:bg-primary
                        disabled:cursor-not-allowed
                        disabled:opacity-50 transition-colors"
                    >
                        {isVerifying ? "Verifying..." : "Verify Email"}
                    </button>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--color-outline-light)] dark:border-[var(--color-outline-dark)]" />
                        </div>
                    </div>
                    <br />
                    <ResendOtp
                        onResend={handleResend}
                        initialSeconds={30}
                        disabled={isVerifying}
                    />
                </div>
            </div>
        </div>
    );
}
