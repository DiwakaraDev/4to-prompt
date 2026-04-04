// src/components/prompts/ShareButton.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import {
  copyShareLink,
  shareToTwitter,
  shareToWhatsApp,
  shareToFacebook,
  nativeShare,
} from "@/utils/share";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { FiShare2, FiLink, FiCheck } from "react-icons/fi";
import { FaWhatsapp, FaFacebook, FaTwitter } from "react-icons/fa";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Props {
  promptId: string;
  title: string;
  promptText: string;
}

export default function ShareButton({ promptId, title, promptText }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const shareData = { title, text: promptText, promptId };

  async function handleCopy() {
    if (!user) {
      toast.error("Sign in to share prompts");
      router.push("/login");
      return;
    }

    await copyShareLink(promptId);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleNative() {
    if (!user) {
      toast.error("Sign in to share prompts");
      router.push("/login");
      return;
    }

    const used = await nativeShare(shareData);
    if (!used) setOpen(true); // fallback to menu if native not available
  }

  function handleTwitter() {
    if (!user) {
      toast.error("Sign in to share prompts");
      router.push("/login");
      return;
    }
    shareToTwitter(shareData);
  }

  function handleWhatsApp() {
    if (!user) {
      toast.error("Sign in to share prompts");
      router.push("/login");
      return;
    }
    shareToWhatsApp(shareData);
  }

  function handleFacebook() {
    if (!user) {
      toast.error("Sign in to share prompts");
      router.push("/login");
      return;
    }
    shareToFacebook(shareData);
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button */}
      <button
        onClick={handleNative}
        aria-label="Share prompt"
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium",
          "text-[#a0a0a0] bg-white/5 hover:bg-white/10 hover:text-[#00f2ff]",
          "transition-all duration-200",
        )}
      >
        <FiShare2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className={cn(
            "absolute bottom-12 left-0 z-50 w-52",
            "bg-[#1e2030] border border-white/10 rounded-2xl shadow-2xl",
            "p-2 flex flex-col gap-1",
            "animate-in fade-in slide-in-from-bottom-2 duration-200",
          )}
        >
          <p className="text-xs text-[#a0a0a0] px-3 py-1">Share via</p>

          {/* Copy Link */}
          <ShareOption
            icon={copied ? <FiCheck className="text-green-400" /> : <FiLink />}
            label={copied ? "Copied!" : "Copy link"}
            onClick={handleCopy}
          />

          {/* Twitter / X */}
          <ShareOption
            icon={<FaTwitter className="text-sky-400" />}
            label="Twitter / X"
            onClick={handleTwitter}
          />

          {/* WhatsApp */}
          <ShareOption
            icon={<FaWhatsapp className="text-green-400" />}
            label="WhatsApp"
            onClick={handleWhatsApp}
          />

          {/* Facebook */}
          <ShareOption
            icon={<FaFacebook className="text-blue-500" />}
            label="Facebook"
            onClick={handleFacebook}
          />
        </div>
      )}
    </div>
  );
}

function ShareOption({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm",
        "text-[#f0f0f0] hover:bg-white/8 transition-colors duration-150 text-left",
      )}
    >
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      {label}
    </button>
  );
}
