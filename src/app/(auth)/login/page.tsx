// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginWithEmail, getAuthErrorMessage } from "@/services/auth.service";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  RiMailLine, RiLockLine, RiEyeLine,
  RiEyeOffLine, RiArrowRightLine,
} from "react-icons/ri";
import type { AuthError } from "firebase/auth";

interface FormState {
  email:    string;
  password: string;
}

interface FormErrors {
  email?:    string;
  password?: string;
  general?:  string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form,     setForm]     = useState<FormState>({ email: "", password: "" });
  const [errors,   setErrors]   = useState<FormErrors>({});
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  // ─── Client-side validation ───────────────────────────────
  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await loginWithEmail(form.email, form.password);
      toast.success("Welcome back!");
      router.push("/");
      router.refresh();
    } catch (err) {
      const msg = getAuthErrorMessage(err as AuthError);
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  return (
    <div className="w-full max-w-[420px] animate-fadeInUp">

      {/* Card */}
      <div className="glass-strong rounded-3xl overflow-hidden">

        {/* Top gradient bar */}
        <div className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))" }} />

        <div className="p-6">

          {/* Header */}
          <div className="text-center mb-5">
            <h1
              style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 800 }}
              className="mb-2"
            >
              Welcome Back
            </h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Sign in to your 4to Prompt account
            </p>
          </div>

          {/* Google button */}
          <GoogleButton label="Sign in with Google" redirectTo="/" />

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--color-text-faint)" }}>
              OR
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* General error */}
          {errors.general && (
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5 animate-fadeIn"
              style={{
                background:  "rgba(240,80,80,0.08)",
                border:      "1px solid rgba(240,80,80,0.22)",
              }}
            >
              <span style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>
                {errors.general}
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="label">Email Address</label>
              <div className="relative">
                <RiMailLine
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: errors.email ? "var(--color-error)" : "var(--color-text-faint)" }}
                />
                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={e => handleChange("email", e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={cn("input pl-11", errors.email && "input-error")}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="form-error animate-fadeIn">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="label" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs transition-colors hover:text-[var(--color-primary)]"
                  style={{ color: "var(--color-text-faint)" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <RiLockLine
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: errors.password ? "var(--color-error)" : "var(--color-text-faint)" }}
                />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => handleChange("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn("input pl-11 pr-12", errors.password && "input-error")}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--color-text-faint)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text-muted)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-faint)")}
                >
                  {showPass ? <RiEyeOffLine size={17} /> : <RiEyeLine size={17} />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="form-error animate-fadeIn">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-1 group"
              style={{ minHeight: "44px", fontSize: "0.875rem" }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <RiArrowRightLine
                    size={17}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p
            className="text-center text-sm mt-4"
            style={{ color: "var(--color-text-muted)" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold transition-colors hover:text-[var(--color-primary-hover)]"
              style={{ color: "var(--color-primary)" }}
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}