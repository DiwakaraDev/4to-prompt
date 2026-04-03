// src/components/prompts/PromptCard.tsx
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/types";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  RiFileCopyLine, RiCheckLine, RiVipCrownLine,
  RiHeartLine,
} from "react-icons/ri";

interface PromptCardProps {
  prompt:    Prompt;
  isPremiumUser?: boolean;
}

export function PromptCard({ prompt, isPremiumUser = false }: PromptCardProps) {
  const [copied,  setCopied]  = useState(false);

  const isLocked = prompt.isPremium && !isPremiumUser;

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLocked) return;
    try {
      await navigator.clipboard.writeText(prompt.promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — silently ignore */
    }
  }, [prompt.promptText, isLocked]);

  return (
    <article className="card group" aria-label={prompt.title}>
      {/* Image */}
      <Link href={`/prompt/${prompt.id}`} aria-label={`View ${prompt.title}`}>
        <div className="card-image">
          <OptimizedImage
            src={prompt.imageUrl}
            alt={prompt.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            containerClassName="w-full h-full"
            fallbackClassName="w-full h-full"
          />

          {/* Premium overlay */}
          {isLocked && (
            <div className="premium-lock">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(245,200,66,0.15)", border: "1px solid rgba(245,200,66,0.3)" }}>
                  <RiVipCrownLine size={17} style={{ color: "var(--color-gold)" }} />
                </div>
                <span className="text-xs font-bold" style={{ color: "var(--color-gold)" }}>
                  Premium
                </span>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className={cn("badge", prompt.isPremium ? "badge-premium" : "badge-free")}>
              {prompt.isPremium ? "✦ Premium" : "Free"}
            </span>
          </div>

          {/* Hover: copy button overlay */}
          {!isLocked && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0
                            group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: "rgba(10,12,22,0.55)", backdropFilter: "blur(2px)" }}>
              <button
                onClick={handleCopy}
                aria-label="Copy prompt"
                className={cn("copy-btn", copied && "copied")}
              >
                {copied
                  ? <><RiCheckLine size={13} />Copied!</>
                  : <><RiFileCopyLine size={13} />Copy Prompt</>
                }
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="card-body">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Link
            href={`/prompt/${prompt.id}`}
            className="text-sm font-semibold leading-tight line-clamp-1 hover:text-[var(--color-primary)]
                       transition-colors"
            style={{ color: "var(--color-text)" }}
          >
            {prompt.title}
          </Link>
          <span className="badge badge-primary shrink-0" style={{ fontSize: "10px" }}>
            {prompt.category}
          </span>
        </div>

        <p className="text-xs line-clamp-2 mb-3"
          style={{ color: "var(--color-text-muted)", lineHeight: 1.5 }}>
          {isLocked ? "Unlock premium to see this prompt..." : prompt.promptText}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1" style={{ color: "var(--color-text-faint)" }}>
            <RiHeartLine size={13} />
            <span className="text-xs">{prompt.likesCount ?? 0}</span>
          </div>

          {isLocked ? (
            <Link href="/register" className="btn btn-gold btn-sm" style={{ fontSize: "11px" }}>
              <RiVipCrownLine size={12} />
              Unlock
            </Link>
          ) : (
            <button
              onClick={handleCopy}
              aria-label="Copy prompt text"
              className={cn("copy-btn", copied && "copied")}
              style={{ fontSize: "11px", minHeight: "28px", padding: "4px 10px" }}
            >
              {copied
                ? <><RiCheckLine size={12} />Copied</>
                : <><RiFileCopyLine size={12} />Copy</>
              }
            </button>
          )}
        </div>
      </div>
    </article>
  );
}