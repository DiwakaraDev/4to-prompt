// src/app/not-found.tsx
import Link from "next/link";
import { RiGhostLine, RiArrowLeftLine } from "react-icons/ri";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center">
      {/* Ambient */}
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{
        background: `
          radial-gradient(ellipse 60% 50% at 50% 40%,
            rgba(188,103,255,0.08) 0%, transparent 60%)
        `,
      }} />

      <div className="animate-fadeInUp flex flex-col items-center gap-5">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
          <RiGhostLine size={28} style={{ color: "var(--color-primary)" }} />
        </div>

        {/* 404 */}
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(4rem, 12vw, 8rem)",
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.05em",
        }} className="gradient-text-primary">
          404
        </div>

        <div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-lg)",
            fontWeight: 700,
          }} className="mb-2">
            Page Not Found
          </h1>
          <p className="text-sm max-w-xs"
            style={{ color: "var(--color-text-muted)" }}>
            This page doesn&apos;t exist or was moved. Head back home.
          </p>
        </div>

        <Link href="/" className="btn btn-primary group">
          <RiArrowLeftLine size={15}
            className="transition-transform duration-150 group-hover:-translate-x-0.5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}