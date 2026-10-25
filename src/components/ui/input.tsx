import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-control border border-border-strong bg-surface-solid px-3 text-sm text-text placeholder:text-muted",
        className,
      )}
      {...props}
    />
  );
}
