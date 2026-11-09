
"use client";

import { useEffect, useState } from "react";

interface ResendOtpProps {
    onResend: () => Promise<void>;
    initialSeconds?: number;
    disabled?: boolean;
    startImmediately?: boolean;
}

export default function ResendOtp({
    onResend,
    initialSeconds = 30,
    disabled = false,
    startImmediately = false,
}: ResendOtpProps) {
    const [countdown, setCountdown] = useState(startImmediately ? initialSeconds : 0);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState("");

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    // Format countdown as MM:SS
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    // Resend OTP
    const handleResend = async () => {
        if (countdown > 0 || isResending || disabled) return;

        setIsResending(true);
        setError("");

        try {
            await onResend();

            // Restart countdown only after successful API response
            setCountdown(initialSeconds);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to resend verification code."
            );
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
                <span className="text-gray-500">
                    Didn't receive the code?
                </span>
                <br />
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || isResending || disabled}
                    className="font-semibold text-[#007a78]
            hover:text-[#004c4b]
            disabled:cursor-not-allowed
            disabled:text-gray-400
            transition-colors"
                >
                    {isResending
                        ? "Sending..."
                        : countdown > 0
                            ? "Resend OTP"
                            : "Resend OTP"}
                </button>
            </div>

            {countdown > 0 && (
                <p className="text-xs text-gray-500">
                    You can request a new code in{" "}
                    <span className="font-semibold text-[#007a78]">
                        {formatTime(countdown)}
                    </span>
                </p>
            )}

            {error && (
                <p className="text-xs text-red-500 text-center">
                    {error}
                </p>
            )}
        </div>
    );
}
