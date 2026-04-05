// src/components/prompts/PremiumLockModal.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  RiVipCrownLine,
  RiCheckLine,
  RiWhatsappLine,
  RiCloseLine,
  RiTimeLine,
} from "react-icons/ri";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import {
  submitPaymentRequest,
  buildWhatsAppLink,
  PREMIUM_PRICE_LKR,
} from "@/services/premium.service";
import toast from "react-hot-toast";

interface PremiumLockModalProps {
  onClose?: () => void;
}

type Step = "info" | "pending" | "done";

export function PremiumLockModal({ onClose }: PremiumLockModalProps) {
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);
  const [step, setStep] = useState<Step>("info");
  const [loading, setLoading]   = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  const handleUnlockClick = useCallback(async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const id = await submitPaymentRequest(user.uid, user.name, user.email);
      setRequestId(id);
      setStep("pending");
    } catch {
      toast.error("Failed to create request. Try again.");
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  const handleWhatsApp = useCallback(() => {
    if (!user || !requestId) return;
    const link = buildWhatsAppLink(user.uid, user.email, requestId);
    window.open(link, "_blank", "noopener,noreferrer");
    setStep("done");
  }, [user, requestId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,6,12,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-6 shadow-2xl"
        style={{
          background:
            "linear-gradient(160deg, rgba(26,18,4,0.98) 0%, rgba(20,15,30,0.98) 100%)",
          border: "1px solid rgba(245,200,66,0.18)",
        }}
      >
        {/* close */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full p-1 text-[var(--color-text-faint)] hover:text-white transition-colors"
          >
            <RiCloseLine size={18} />
          </button>
        )}

        {/* icon */}
        <div className="mb-5 flex justify-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(245,200,66,0.2), rgba(245,200,66,0.05))",
              border: "1px solid rgba(245,200,66,0.3)",
            }}
          >
            <RiVipCrownLine size={32} style={{ color: "#f5c842" }} />
          </div>
        </div>

        {/* ── Step: info ── */}
        {step === "info" && (
          <div className="text-center">
            <h2
              className="mb-1 text-xl font-bold"
              style={{ color: "#f5c842" }}
            >
              Unlock Premium Access
            </h2>
            <p className="mb-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Get full access to all premium AI prompts for one year.
            </p>

            {/* price card */}
            <div
              className="mb-6 rounded-2xl p-4"
              style={{
                background: "rgba(245,200,66,0.06)",
                border: "1px solid rgba(245,200,66,0.14)",
              }}
            >
              <div className="mb-3 flex items-center justify-between text-sm">
                <span style={{ color: "var(--color-text-muted)" }}>Plan</span>
                <span className="font-semibold text-white">Premium — 1 Year</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--color-text-muted)" }}>Amount</span>
                <span className="text-lg font-bold" style={{ color: "#f5c842" }}>
                  LKR {PREMIUM_PRICE_LKR.toLocaleString()}
                </span>
              </div>
            </div>

            {/* what you get */}
            <ul className="mb-6 space-y-2 text-left">
              {[
                "Unlimited premium prompt access",
                "Copy any premium prompt instantly",
                "Access to all future premium prompts",
                "Valid for 1 full year from activation",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <RiCheckLine size={15} style={{ color: "#f5c842" }} />
                  <span style={{ color: "var(--color-text-muted)" }}>{item}</span>
                </li>
              ))}
            </ul>

            {/* how to pay */}
            <div
              className="mb-6 rounded-2xl p-4 text-left text-xs"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "var(--color-text-muted)",
              }}
            >
              <p className="mb-2 font-semibold text-white">How to pay:</p>
              <p>1. Click the button below to submit your request.</p>
              <p>2. You'll be taken to WhatsApp to message admin.</p>
              <p>3. Complete your payment via bank transfer / cash.</p>
              <p>4. Admin verifies and activates your access.</p>
            </div>

            {!user ? (
              <button
                onClick={() => router.push("/login")}
                className="w-full rounded-2xl py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #f5c842, #e0a800)",
                }}
              >
                Sign In to Continue
              </button>
            ) : (
              <button
                onClick={handleUnlockClick}
                disabled={loading}
                className="w-full rounded-2xl py-3 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #f5c842, #e0a800)",
                }}
              >
                {loading ? "Please wait..." : "I Want to Unlock Premium →"}
              </button>
            )}
          </div>
        )}

        {/* ── Step: pending — send WhatsApp ── */}
        {step === "pending" && (
          <div className="text-center">
            <h2 className="mb-1 text-xl font-bold text-white">
              Request Created ✓
            </h2>
            <p className="mb-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Your payment request has been saved. Now message the admin on WhatsApp to complete your payment.
            </p>

            <div
              className="mb-6 rounded-2xl p-4 text-left text-xs font-mono"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "var(--color-text-muted)",
              }}
            >
              <p className="mb-1 font-sans font-semibold text-white">Your Request Info</p>
              <p>Email: {user?.email}</p>
              <p>Request ID: {requestId}</p>
              <p className="mt-2 font-sans text-yellow-400">
                ⚠ Include this request ID when messaging admin
              </p>
            </div>

            <button
              onClick={handleWhatsApp}
              className={cn(
                "mb-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3",
                "text-sm font-bold text-white transition-opacity hover:opacity-90",
              )}
              style={{ background: "#25D366" }}
            >
              <RiWhatsappLine size={18} />
              Message Admin on WhatsApp
            </button>

            <p className="text-xs" style={{ color: "var(--color-text-faint)" }}>
              After messaging admin and completing payment,<br />
              your access will be activated within a few minutes.
            </p>
          </div>
        )}

        {/* ── Step: done ── */}
        {step === "done" && (
          <div className="text-center">
            <h2 className="mb-1 text-xl font-bold text-white">
              Message Sent ✓
            </h2>
            <p className="mb-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Admin will review your payment and activate your premium access shortly. You'll see premium prompts unlocked on your next visit.
            </p>

            <div
              className="mb-6 flex items-center gap-3 rounded-2xl p-4"
              style={{
                background: "rgba(245,200,66,0.06)",
                border: "1px solid rgba(245,200,66,0.14)",
              }}
            >
              <RiTimeLine size={20} style={{ color: "#f5c842" }} />
              <p className="text-sm text-left" style={{ color: "var(--color-text-muted)" }}>
                Typical activation time: <span className="font-semibold text-white">within 30 minutes</span> during business hours.
              </p>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="w-full rounded-2xl py-3 text-sm font-semibold transition-colors"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--color-text-muted)",
                }}
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}