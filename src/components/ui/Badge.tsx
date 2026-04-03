// src/components/ui/Badge.tsx
import { cn } from "@/lib/utils";

type BadgeVariant = "free" | "premium" | "primary" | "secondary";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "badge",
        {
          "badge-free":      variant === "free",
          "badge-premium":   variant === "premium",
          "badge-primary":   variant === "primary",
          "badge-secondary": variant === "secondary",
        },
        className
      )}
    >
      {children}
    </span>
  );
}