// src/components/prompts/HeroSection.tsx
import Link from "next/link";
import {
  RiArrowRightLine,
  RiFlashlightFill,
  RiFileCopyLine,
  RiImageLine,
  RiVipCrownLine,
  RiSearchLine,
} from "react-icons/ri";

// Floating feature card — decorative right side
function FeatureCard({
  icon, label, sub, glow,
}: {
  icon: React.ReactNode; label: string; sub: string; glow: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: "rgba(22,25,38,0.85)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderTop: "1px solid rgba(255,255,255,0.13)",
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 12px ${glow}`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${glow.replace("0.15", "0.12")}` }}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold" style={{ color: "var(--color-text)", lineHeight: 1.2 }}>
          {label}
        </div>
        <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="hero-heading"
      style={{ minHeight: "calc(100dvh - 72px)", display: "flex", alignItems: "center" }}
    >
      {/* ── Mesh background ─────────────────────────────────── */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {/* Base mesh */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 30%, rgba(188,103,255,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 85% 70%, rgba(0,242,255,0.09) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 60% 10%, rgba(255,0,212,0.06) 0%, transparent 50%)
          `,
        }} />

        {/* Animated blobs */}
        <div className="absolute rounded-full blur-[100px] opacity-[0.14]" style={{
          width: "500px", height: "500px", top: "-80px", left: "-60px",
          background: "radial-gradient(circle, #bc67ff, transparent 70%)",
          animation: "blobFloat1 16s ease-in-out infinite",
        }} />
        <div className="absolute rounded-full blur-[110px] opacity-[0.09]" style={{
          width: "420px", height: "420px", bottom: "-60px", right: "-40px",
          background: "radial-gradient(circle, #00f2ff, transparent 70%)",
          animation: "blobFloat2 20s ease-in-out infinite",
        }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.018]" style={{
          backgroundImage: "radial-gradient(rgba(188,103,255,0.9) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48"
          style={{ background: "linear-gradient(to bottom, transparent, var(--color-bg))" }} />
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="container w-full py-12 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT COLUMN ─────────────────────────────────── */}
          <div className="flex flex-col items-start">

            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-fadeInUp"
              style={{
                background: "linear-gradient(135deg, rgba(188,103,255,0.10), rgba(0,242,255,0.05))",
                border: "1px solid rgba(188,103,255,0.22)",
                boxShadow: "0 0 16px rgba(188,103,255,0.08)",
              }}
            >
              <RiFlashlightFill size={12} style={{ color: "var(--color-primary)" }} />
              <span className="text-xs font-bold uppercase tracking-[0.08em]"
                style={{ color: "var(--color-primary)" }}>
                AI Prompt Gallery
              </span>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "var(--color-secondary)" }} />
            </div>

            {/* Headline — compact and punchy */}
            <h1
              id="hero-heading"
              className="animate-fadeInUp stagger-1 mb-4"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 2.2vw + 0.5rem, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              <span className="gradient-text-subtle">Discover &amp; Copy</span>
              <br />
              <span className="gradient-text-primary">AI Image Prompts</span>
              <br />
              <span className="gradient-text-subtle">That Actually Work</span>
            </h1>

            {/* Sub */}
            <p
              className="animate-fadeInUp stagger-2 mb-7"
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                maxWidth: "42ch",
                lineHeight: 1.7,
              }}
            >
              Browse curated prompts for{" "}
              <span style={{ color: "var(--color-text)", fontWeight: 500 }}>Midjourney</span>,{" "}
              <span style={{ color: "var(--color-text)", fontWeight: 500 }}>DALL·E</span> and{" "}
              <span style={{ color: "var(--color-text)", fontWeight: 500 }}>Stable Diffusion</span>.
              One-click copy. Start creating instantly.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mb-10 animate-fadeInUp stagger-3">
              <Link href="/#prompts" className="btn btn-primary btn-lg group">
                <RiSearchLine size={17} />
                Browse Prompts
                <RiArrowRightLine size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link href="/register" className="btn btn-ghost btn-lg">
                <span className="gradient-text-gold font-bold text-base">✦</span>
                Get Premium
              </Link>
            </div>

            {/* Social proof */}
            <div
              className="flex items-center gap-6 animate-fadeInUp stagger-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "var(--space-6)" }}
            >
              {[
                { value: "2,400+", label: "Prompts",    color: "var(--color-primary)"   },
                { value: "Free",   label: "To Browse",  color: "var(--color-secondary)" },
                { value: "1-Click",label: "Copy",       color: "var(--color-gold)"      },
              ].map(({ value, label, color }) => (
                <div key={label}>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(0.95rem, 1.2vw, 1.2rem)",
                    fontWeight: 800, color, lineHeight: 1,
                  }}>
                    {value}
                  </div>
                  <div className="text-xs uppercase tracking-widest mt-1"
                    style={{ color: "var(--color-text-faint)" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN — Visual panel ─────────────────── */}
          <div className="hidden lg:flex flex-col gap-4 animate-fadeInUp stagger-2">

            {/* Main mock card */}
            <div
              className="rounded-3xl overflow-hidden relative"
              style={{
                background: "linear-gradient(135deg, rgba(188,103,255,0.08), rgba(0,242,255,0.04))",
                border: "1px solid rgba(255,255,255,0.09)",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
                padding: "var(--space-6)",
              }}
            >
              {/* Mock image placeholder */}
              <div
                className="w-full rounded-2xl mb-4 flex items-center justify-center"
                style={{
                  height: "200px",
                  background: "linear-gradient(135deg, rgba(188,103,255,0.20), rgba(0,242,255,0.12), rgba(255,0,212,0.10))",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="text-center">
                  <RiImageLine size={36} style={{ color: "rgba(188,103,255,0.5)", margin: "0 auto 8px" }} />
                  <div className="text-xs font-medium" style={{ color: "var(--color-text-faint)" }}>
                    AI Generated Image
                  </div>
                </div>
              </div>

              {/* Mock prompt text area */}
              <div
                className="rounded-xl p-4 mb-3"
                style={{
                  background: "rgba(13,15,26,0.6)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "var(--color-text-faint)" }}>
                    Prompt
                  </span>
                  <button className="copy-btn">
                    <RiFileCopyLine size={12} />
                    Copy
                  </button>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  A futuristic cityscape at night, neon lights reflecting
                  on wet streets, cyberpunk aesthetic, 8K ultra detail...
                </p>
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between">
                <span className="badge badge-free">FREE</span>
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary">Sci-Fi</span>
                  <span className="text-xs" style={{ color: "var(--color-text-faint)" }}>
                    2.4k copies
                  </span>
                </div>
              </div>
            </div>

            {/* Feature cards row */}
            <div className="grid grid-cols-2 gap-3">
              <FeatureCard
                icon={<RiFileCopyLine size={16} style={{ color: "var(--color-primary)" }} />}
                label="1-Click Copy"
                sub="Instant clipboard"
                glow="rgba(188,103,255,0.15)"
              />
              <FeatureCard
                icon={<RiVipCrownLine size={16} style={{ color: "var(--color-gold)" }} />}
                label="Premium Prompts"
                sub="Exclusive content"
                glow="rgba(245,200,66,0.12)"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}