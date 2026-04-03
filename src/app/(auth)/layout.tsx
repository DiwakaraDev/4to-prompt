// src/app/(auth)/layout.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | 4to Prompt",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Ambient mesh */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 70% 60% at 20% 20%, rgba(188,103,255,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(0,242,255,0.07) 0%, transparent 55%)
          `,
        }} />
        <div className="absolute rounded-full blur-[100px] opacity-[0.10]" style={{
          width: "500px", height: "500px", top: "-100px", left: "-100px",
          background: "radial-gradient(circle, #bc67ff, transparent 70%)",
          animation: "blobFloat1 16s ease-in-out infinite",
        }} />
        <div className="absolute rounded-full blur-[120px] opacity-[0.07]" style={{
          width: "400px", height: "400px", bottom: "-80px", right: "-80px",
          background: "radial-gradient(circle, #00f2ff, transparent 70%)",
          animation: "blobFloat2 20s ease-in-out infinite",
        }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "radial-gradient(rgba(188,103,255,0.9) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
      </div>

      {/* Navbar strip */}
      <header className="glass-nav" style={{ height: "52px" }}>
        <div className="container h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Back to home">
            <svg width="30" height="30" viewBox="0 0 36 36" fill="none" aria-hidden="true"
              className="transition-transform duration-300 group-hover:scale-110">
              <rect width="36" height="36" rx="10" fill="url(#authLogoGrad)" />
              <path d="M11 13.5L18 9.5L25 13.5V22.5L18 26.5L11 22.5Z"
                stroke="white" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
              <circle cx="18" cy="18" r="2.5" fill="white" opacity="0.95" />
              <defs>
                <linearGradient id="authLogoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#bc67ff" />
                  <stop offset="0.5" stopColor="#7c3af5" />
                  <stop offset="1" stopColor="#00c8ff" />
                </linearGradient>
              </defs>
            </svg>
            <span style={{
              fontFamily: "var(--font-display)", fontSize: "1rem",
              fontWeight: 800, letterSpacing: "-0.02em",
            }} className="gradient-text-primary">
              4to Prompt
            </span>
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 py-12"
      >
        {children}
      </main>

      <footer className="text-center py-6">
        <p className="text-xs" style={{ color: "var(--color-text-faint)" }}>
          © {new Date().getFullYear()} 4to Prompt. All rights reserved.
        </p>
      </footer>
    </div>
  );
}