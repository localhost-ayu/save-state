import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const VARIANTS = {
  primary: "bg-accent-fill text-accent-fill-contrast hover:opacity-90",
  secondary: "border border-border-strong bg-surface-solid text-text hover:bg-surface-raised",
  ghost: "text-muted hover:bg-surface-raised hover:text-text",
} as const;

type ButtonProps = ComponentProps<"button"> & { variant?: keyof typeof VARIANTS };

export function Button({ variant = "primary", type = "button", className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-medium transition",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
