
"use client";

import { useEffect, useRef, useState } from "react";

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export default function OtpInput({
    length = 6,
    value,
    onChange,
    error,
    disabled = false,
}: OtpInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Split OTP value into individual digits
    const otpArray = Array.from(
        { length },
        (_, index) => value[index] || ""
    );

    // Focus first input when component loads
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Handle individual digit input
    const handleChange = (index: number, inputValue: string) => {
        const digit = inputValue.replace(/\D/g, "");

        if (!digit) {
            const newOtp = [...otpArray];
            newOtp[index] = "";
            onChange(newOtp.join(""));
            return;
        }

        const newOtp = [...otpArray];

        // Handle multiple characters
        if (digit.length > 1) {
            handlePaste(digit);
            return;
        }

        newOtp[index] = digit[0];

        onChange(newOtp.join(""));

        // Move to next input
        if (index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace and arrow keys
    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Backspace") {
            if (!otpArray[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }

        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (e.key === "ArrowRight" && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle pasting OTP
    const handlePaste = (pastedValue: string) => {
        const digits = pastedValue.replace(/\D/g, "").slice(0, length);

        onChange(digits);

        const nextIndex = Math.min(digits.length, length - 1);

        inputRefs.current[nextIndex]?.focus();
    };

    return (
        <div className="w-full space-y-1">
            <div className="flex gap-3 sm:gap-3">
                {otpArray.map((digit, index) => (
                    <input
                        key={index}
                        ref={(element) => {
                            inputRefs.current[index] = element;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        value={digit}
                        disabled={disabled}
                        aria-label={`OTP digit ${index + 1}`}
                        aria-invalid={!!error}
                        onChange={(e) =>
                            handleChange(index, e.target.value)
                        }
                        onKeyDown={(e) =>
                            handleKeyDown(index, e)
                        }
                        onPaste={(e) => {
                            e.preventDefault();
                            handlePaste(e.clipboardData.getData("text"));
                        }}
                        className={`
                        h-11 w-11 sm:h-14 sm:w-14
                        rounded-lg border text-center
                        text-xl font-semibold bg-white
                        outline-none transition-all
                        ${error
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-300 focus:border-[#007a78]"
                            }
                        focus:ring-2 focus:ring-[#007a78]/20
                        disabled:cursor-not-allowed
                        disabled:bg-gray-100
                        `}
                    />
                ))}
            </div>

            {error && (
                <p className="text-center text-sm text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}
