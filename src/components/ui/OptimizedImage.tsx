// src/components/ui/OptimizedImage.tsx
"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { RiImageLine } from "react-icons/ri";

interface OptimizedImageProps extends Omit<ImageProps, "onError"> {
  fallbackClassName?: string;
  containerClassName?: string;
  showSkeleton?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackClassName,
  containerClassName,
  showSkeleton = true,
  ...props
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2",
          fallbackClassName,
        )}
        style={{ background: "var(--color-surface-3)" }}
        role="img"
        aria-label={typeof alt === "string" ? alt : "Image unavailable"}
      >
        <RiImageLine size={24} style={{ color: "var(--color-text-faint)" }} />
        <span className="text-xs" style={{ color: "var(--color-text-faint)" }}>
          Unavailable
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {/* Skeleton shimmer while loading */}
      {loading && showSkeleton && (
        <div className="skeleton absolute inset-0 z-10" aria-hidden="true" />
      )}
      <Image
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          loading ? "opacity-0" : "opacity-100",
          className,
        )}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
        {...props}
      />
    </div>
  );
}