// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/config";
import { getAuthErrorMessage } from "@/services/auth.service";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  RiMailLine, RiArrowRightLine,
  RiCheckLine, RiArrowLeftLine,
} from "react-icons/ri";
import type { AuthError } from "firebase/auth";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) { setError("Email is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
      toast.success("Reset email sent!");
    } catch (err) {
      const msg = getAuthErrorMessage(err as AuthError);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[420px] animate-fadeInUp">
      <div className="glass-strong rounded-3xl overflow-hidden">

        {/* Top gradient bar */}
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))" }}
        />

        <div className="p-6">

          {/* Header */}
          <div className="text-center mb-5">
            <h1
              className="mb-2"
              style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 800 }}
            >
              Reset Password
            </h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              {sent
                ? "Check your inbox for the reset link"
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {/* ── Success state ── */}
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4 animate-fadeIn">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(34,197,94,0.10)",
                  border:     "1px solid rgba(34,197,94,0.25)",
                }}
              >
                <RiCheckLine size={28} style={{ color: "var(--color-success)" }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                  Email sent to
                </p>
                <p className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>
                  {email}
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
                  Didn&apos;t receive it?{" "}
                  <button
                    onClick={() => { setSent(false); setError(null); }}
                    className="font-semibold transition-colors hover:text-[var(--color-primary-hover)]"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Try again
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Error banner */}
              {error && (
                <div
                  className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5 animate-fadeIn"
                  style={{
                    background: "rgba(240,80,80,0.08)",
                    border:     "1px solid rgba(240,80,80,0.22)",
                  }}
                >
                  <span style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>
                    {error}
                  </span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
                <div>
                  <label htmlFor="reset-email" className="label">Email Address</label>
                  <div className="relative">
                    <RiMailLine
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: error ? "var(--color-error)" : "var(--color-text-faint)" }}
                    />
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      className={cn("input pl-11", error && "input-error")}
                      aria-invalid={!!error}
                      aria-describedby={error ? "reset-email-error" : undefined}
                    />
                  </div>
                  {error && (
                    <p id="reset-email-error" className="form-error animate-fadeIn">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full mt-1 group"
                  style={{ minHeight: "44px", fontSize: "0.875rem" }}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <RiArrowRightLine
                        size={17}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Back to login */}
          <p className="text-center text-sm mt-4" style={{ color: "var(--color-text-muted)" }}>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-semibold transition-colors
                         hover:text-[var(--color-primary-hover)]"
              style={{ color: "var(--color-primary)" }}
            >
              <RiArrowLeftLine size={14} />
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}