// src/components/layout/AnimatedBackground.tsx
// Server Component — pure CSS, zero JS, zero runtime cost

export function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">

      {/* Dot grid */}
      <div className="animated-bg-grid" />

      {/* Aurora ring — slowly rotates behind everything */}
      <div className="animated-bg-aurora" />

      {/* Floating orbs */}
      <div className="animated-bg-orb orb-violet-main" />
      <div className="animated-bg-orb orb-cyan-main"   />
      <div className="animated-bg-orb orb-magenta"     />
      <div className="animated-bg-orb orb-violet-soft" />
      <div className="animated-bg-orb orb-cyan-soft"   />

      {/* Horizontal scan line — subtle sweep */}
      <div className="animated-bg-scanline" />
    </div>
  );
}