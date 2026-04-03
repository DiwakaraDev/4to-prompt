// src/components/ui/Spinner.tsx
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        sizes[size],
        "border-2 border-white/10 border-t-[var(--color-primary)] rounded-full animate-spin",
        className
      )}
    />
  );
}