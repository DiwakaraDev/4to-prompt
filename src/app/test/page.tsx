// src/app/test/page.tsx  — DELETE AFTER VERIFYING
export default function TestPage() {
  return (
    <main style={{ padding: "2rem", background: "var(--color-bg)", minHeight: "100vh" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", marginBottom: "2rem" }}
          className="gradient-text-primary">
        4to Prompt — Design System
      </h1>

      {/* Surfaces */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "var(--text-lg)", color: "var(--color-text-muted)", marginBottom: "1rem" }}>Surfaces</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {["bg", "surface", "surface-2", "surface-3"].map(s => (
            <div key={s} style={{ background: `var(--color-${s})`, border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1rem 1.5rem", minWidth: "140px" }}>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>--color-{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "var(--text-lg)", color: "var(--color-text-muted)", marginBottom: "1rem" }}>Buttons</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-ghost">Ghost</button>
          <button className="btn btn-gold">✦ Premium</button>
          <button className="btn btn-danger">Delete</button>
        </div>
      </section>

      {/* Badges */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "var(--text-lg)", color: "var(--color-text-muted)", marginBottom: "1rem" }}>Badges</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <span className="badge badge-free">FREE</span>
          <span className="badge badge-premium">✦ PREMIUM</span>
          <span className="badge badge-primary">New</span>
          <span className="badge badge-secondary">Trending</span>
        </div>
      </section>

      {/* Skeletons */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "var(--text-lg)", color: "var(--color-text-muted)", marginBottom: "1rem" }}>Skeletons</h2>
        <div style={{ maxWidth: "280px" }}>
          <div className="skeleton skeleton-image" style={{ marginBottom: "1rem", borderRadius: "var(--radius-lg)" }} />
          <div className="skeleton skeleton-heading" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text-sm" />
        </div>
      </section>

      {/* Glass */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "var(--text-lg)", color: "var(--color-text-muted)", marginBottom: "1rem" }}>Glassmorphism</h2>
        <div className="glass" style={{ padding: "1.5rem", maxWidth: "320px" }}>
          <p style={{ color: "var(--color-text)" }}>This is a glassmorphism card with blur and subtle border.</p>
        </div>
      </section>

      {/* Gradients */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "var(--text-lg)", color: "var(--color-text-muted)", marginBottom: "1rem" }}>Gradient Text</h2>
        <h2 style={{ fontSize: "var(--text-xl)" }} className="gradient-text-primary">Primary gradient text</h2>
        <h2 style={{ fontSize: "var(--text-xl)" }} className="gradient-text-gold">Gold premium text</h2>
        <h2 style={{ fontSize: "var(--text-xl)" }} className="gradient-text-accent">Accent text</h2>
      </section>
    </main>
  );
}