import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, error, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {startIcon && (
          <div className="absolute left-4 flex items-center pointer-events-none text-[var(--text-hint)]">
            {startIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-xl bg-[var(--input-fill)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--text-hint)] border transition-all duration-150 shadow-[var(--shadow-input)]",
            "border-[var(--input-border)] hover:border-[var(--border)]",
            "focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            startIcon && "pl-11",
            endIcon && "pr-11",
            error && "border-[var(--color-error)] focus-visible:border-[var(--color-error)] focus-visible:ring-[var(--color-error)]",
            className
          )}
          ref={ref}
          {...props}
        />
        {endIcon && (
          <div className="absolute right-3.5 flex items-center text-[var(--text-hint)]">
            {endIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
