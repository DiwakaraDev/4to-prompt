// src/components/prompts/LikeButton.tsx
"use client";
import { useLike } from "@/hooks/useLike";
import { cn }      from "@/lib/utils";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

interface Props {
  promptId:     string;
  initialCount: number;
}

export default function LikeButton({ promptId, initialCount }: Props) {
  const { liked, count, toggle, loading } = useLike(promptId, initialCount);

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={liked ? "Unlike prompt" : "Like prompt"}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium",
        "transition-all duration-200 select-none",
        liked
          ? "text-pink-400 bg-pink-400/10 hover:bg-pink-400/20"
          : "text-[#a0a0a0] bg-white/5 hover:bg-white/10 hover:text-pink-400",
        loading && "opacity-60 cursor-not-allowed"
      )}
    >
      {liked
        ? <AiFillHeart  className="w-5 h-5 animate-pulse-once" />
        : <AiOutlineHeart className="w-5 h-5" />
      }
      <span>{count.toLocaleString()}</span>
    </button>
  );
}