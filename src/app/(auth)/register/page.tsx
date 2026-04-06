// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerWithEmail, getAuthErrorMessage } from "@/services/auth.service";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { BrandLogo } from "@/components/auth/BrandLogo";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  RiUserLine, RiMailLine, RiLockLine,
  RiEyeLine, RiEyeOffLine, RiArrowRightLine,
  RiCheckLine,
} from "react-icons/ri";
import type { AuthError } from "firebase/auth";

interface FormState {
  name:            string;
  email:           string;
  password:        string;
  confirmPassword: string;
}

interface FormErrors {
  name?:            string;
  email?:           string;
  password?:        string;
  confirmPassword?: string;
  general?:         string;
}

// Password strength checker
function getPasswordStrength(pass: string): {
  score: number; label: string; color: string;
} {
  if (!pass) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pass.length >= 8)           score++;
  if (/[A-Z]/.test(pass))         score++;
  if (/[0-9]/.test(pass))         score++;
  if (/[^A-Za-z0-9]/.test(pass))  score++;

  const map = [
    { label: "Weak",      color: "#f05050" },
    { label: "Fair",      color: "#f59e0b" },
    { label: "Good",      color: "#22c55e" },
    { label: "Strong",    color: "#00f2ff" },
    { label: "Very Strong", color: "#bc67ff" },
  ];
  return { score, ...map[score] };
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "", email: "", password: "", confirmPassword: "",
  });
  const [errors,      setErrors]      = useState<FormErrors>({});
  const [loading,     setLoading]     = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(form.password);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim())
      e.name = "Your name is required.";
    else if (form.name.trim().length < 2)
      e.name = "Name must be at least 2 characters.";

    if (!form.email.trim())
      e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";

    if (!form.password)
      e.password = "Password is required.";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters.";

    if (!form.confirmPassword)
      e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords don't match.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await registerWithEmail(form.email, form.password, form.name.trim());
      toast.success("Account created! Welcome to 4to Prompt 🎉");
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
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  return (
    <div className="w-full max-w-110 animate-fadeInUp">
      <div className="glass-strong rounded-3xl overflow-hidden">

        {/* Top gradient bar */}
        <div className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, var(--color-accent), var(--color-primary), var(--color-secondary))" }} />

        <div className="p-6">

          <div className="mb-5 flex justify-center">
            <BrandLogo
              href="/"
              showWordmark={false}
              imageClassName="h-14 w-auto"
              className="justify-center"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-5">
            <h1
              style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 800 }}
              className="mb-2"
            >
              Create Account
            </h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Join thousands of AI creators on 4to Prompt
            </p>
          </div>

          {/* Google */}
          <GoogleButton label="Sign up with Google" redirectTo="/" />

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--color-text-faint)" }}>OR</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* General error */}
          {errors.general && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5 animate-fadeIn"
              style={{ background: "rgba(240,80,80,0.08)", border: "1px solid rgba(240,80,80,0.22)" }}>
              <span style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>
                {errors.general}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">

            {/* Name */}
            <div>
              <label htmlFor="reg-name" className="label">Full Name</label>
              <div className="relative">
                <RiUserLine size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: errors.name ? "var(--color-error)" : "var(--color-text-faint)" }} />
                <input
                  id="reg-name" type="text"
                  value={form.name}
                  onChange={e => handleChange("name", e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                  className={cn("input pl-11", errors.name && "input-error")}
                  aria-invalid={!!errors.name}
                />
              </div>
              {errors.name && <p className="form-error animate-fadeIn">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="label">Email Address</label>
              <div className="relative">
                <RiMailLine size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: errors.email ? "var(--color-error)" : "var(--color-text-faint)" }} />
                <input
                  id="reg-email" type="email"
                  value={form.email}
                  onChange={e => handleChange("email", e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={cn("input pl-11", errors.email && "input-error")}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="form-error animate-fadeIn">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="label">Password</label>
              <div className="relative">
                <RiLockLine size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: errors.password ? "var(--color-error)" : "var(--color-text-faint)" }} />
                <input
                  id="reg-password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => handleChange("password", e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className={cn("input pl-11 pr-12", errors.password && "input-error")}
                  aria-invalid={!!errors.password}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  aria-label={showPass ? "Hide" : "Show"}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-faint)" }}>
                  {showPass ? <RiEyeOffLine size={17} /> : <RiEyeLine size={17} />}
                </button>
              </div>

              {/* Strength meter */}
              {form.password && (
                <div className="mt-2 animate-fadeIn">
                  <div className="flex gap-1 mb-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: i < strength.score ? strength.color : "rgba(255,255,255,0.08)",
                        }} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-text-faint)" }}>
                      {strength.score < 3 && "Add numbers & symbols to strengthen"}
                    </span>
                  </div>
                </div>
              )}
              {errors.password && <p className="form-error animate-fadeIn">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="reg-confirm" className="label">Confirm Password</label>
              <div className="relative">
                <RiLockLine size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: errors.confirmPassword ? "var(--color-error)" : "var(--color-text-faint)" }} />
                <input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={e => handleChange("confirmPassword", e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={cn("input pl-11 pr-12", errors.confirmPassword && "input-error")}
                  aria-invalid={!!errors.confirmPassword}
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)}
                  aria-label={showConfirm ? "Hide" : "Show"}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-faint)" }}>
                  {showConfirm ? <RiEyeOffLine size={17} /> : <RiEyeLine size={17} />}
                </button>
                {/* Match checkmark */}
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <div className="absolute right-11 top-1/2 -translate-y-1/2 animate-fadeIn">
                    <RiCheckLine size={16} style={{ color: "var(--color-success)" }} />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="form-error animate-fadeIn">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2 group"
              style={{ minHeight: "44px", fontSize: "0.875rem" }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Free Account
                  <RiArrowRightLine size={17}
                    className="transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm mt-4" style={{ color: "var(--color-text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login"
              className="font-semibold transition-colors hover:text-primary-hover"
              style={{ color: "var(--color-primary)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}