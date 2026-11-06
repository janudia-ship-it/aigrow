"use client";

import { useState } from "react";

interface OtpVerificationParams {
    email: string;
    userName?: string;
}

export function useOtpVerification(params: string | OtpVerificationParams) {
    const email = typeof params === "string" ? params : params.email;
    const userName = typeof params === "string" ? "" : params.userName || "";

    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleResendOtp = async () => {
        setErrorMessage("");

        const response = await fetch("/api/auth/resend-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, userName: userName || email }),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success === false) {
            const message = result.message || "Failed to resend verification code.";
            setErrorMessage(message);
            throw new Error(message);
        }

        return result;
    };

    const handleVerifyOtp = async (otp: string) => {
        setIsVerifying(true);
        setErrorMessage("");

        try {
            const response = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    userName: userName || email,
                    otp,
                }),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || result.success === false || result.verified === false) {
                throw new Error(result.message || "Email verification failed.");
            }

            setIsVerified(true);
            return true;
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Verification failed."
            );
            return false;
        } finally {
            setIsVerifying(false);
        }
    };

    return {
        isVerifying,
        isVerified,
        errorMessage,
        handleResendOtp,
        handleVerifyOtp,
    };
}
