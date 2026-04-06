// src/components/layout/AnimatedBackground.tsx
export function AnimatedBackground() {
  return (
    <div className="abg" aria-hidden="true">
      {/* Morphing mesh gradient — CSS @property animated */}
      <div className="abg-mesh" />

      {/* Dot particle field */}
      <div className="abg-dots" />

      {/* Tron perspective grid — bottom horizon */}
      <div className="abg-grid" />

      {/* Floating orbs */}
      <div className="abg-orb abg-orb-1" />
      <div className="abg-orb abg-orb-2" />
      <div className="abg-orb abg-orb-3" />

      {/* Sweeping light beams */}
      <div className="abg-beam abg-beam-1" />
      <div className="abg-beam abg-beam-2" />

      {/* Pulse rings — ripple from center */}
      <div className="abg-rings">
        <div className="abg-ring abg-ring-1" />
        <div className="abg-ring abg-ring-2" />
        <div className="abg-ring abg-ring-3" />
      </div>

      {/* Edge vignette — keeps content readable */}
      <div className="abg-vignette" />
    </div>
  );
}