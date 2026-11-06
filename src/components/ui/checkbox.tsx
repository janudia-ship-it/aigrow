"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="flex items-center gap-2 select-none">
        <label
          htmlFor={checkboxId}
          className="relative flex items-center justify-center cursor-pointer group"
        >
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            checked={checked}
            onChange={handleChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-4 w-4 rounded border border-[var(--border)] bg-[var(--surface)] transition-all duration-150 flex items-center justify-center shadow-xs",
              "peer-checked:bg-[var(--color-primary)] peer-checked:border-[var(--color-primary)] peer-checked:text-white text-transparent",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary)] peer-focus-visible:ring-offset-1",
              className
            )}
          >
            <Check className="h-3 w-3 stroke-[3]" />
          </div>
        </label>
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-xs sm:text-sm font-medium text-[var(--foreground)] cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
