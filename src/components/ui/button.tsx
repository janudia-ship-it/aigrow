import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-teal-medium)] shadow-[var(--shadow-button)] active:opacity-90",
        outline:
          "border border-[var(--color-google-border)] bg-[var(--color-surface-light)] text-[var(--color-text-primary-light)] hover:bg-[var(--color-google-hover)]",
        secondary:
          "bg-[var(--color-fertigating-bg-light)] text-[var(--color-primary)] hover:bg-[var(--color-fertigating-pulse-light)] border border-[var(--color-fertigating-border-light)]",
        ghost:
          "text-[var(--color-text-secondary-light)] hover:bg-[var(--color-fertigating-bg-light)]",
        link:
          "text-[var(--color-link)] underline-offset-4 hover:underline hover:text-[var(--color-link-hover)] p-0 h-auto",
        danger:
          "bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-dark)]",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
      shape: {
        pill: "rounded-full",
        rounded: "rounded-xl",
        default: "rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "pill",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, shape, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

