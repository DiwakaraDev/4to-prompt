// src/components/layout/Footer.tsx
import Link from "next/link";
import { RiGithubLine, RiTwitterXLine, RiHeartFill } from "react-icons/ri";

const LINKS = {
  Explore: [
    { label: "Browse Prompts", href: "/" },
    { label: "Free Prompts",   href: "/#free" },
    { label: "Premium",        href: "/#premium" },
  ],
  Account: [
    { label: "Sign In",   href: "/login" },
    { label: "Register",  href: "/register" },
    { label: "Profile",   href: "/profile" },
  ],
};

export function Footer() {
  return (
    <footer
      role="contentinfo"
      style={{
        background:  "var(--color-surface)",
        borderTop:   "1px solid var(--color-divider)",
      }}
    >
      <div className="container section-tight">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <rect width="36" height="36" rx="10" fill="url(#footerLogoGrad)" />
                <path d="M10 13 L18 9 L26 13 L26 23 L18 27 L10 23 Z"
                  stroke="white" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                <circle cx="18" cy="18" r="3" fill="white" opacity="0.9" />
                <defs>
                  <linearGradient id="footerLogoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#bc67ff" />
                    <stop offset="1" stopColor="#00f2ff" />
                  </linearGradient>
                </defs>
              </svg>
              <span
                className="gradient-text-primary font-bold"
                style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)" }}
              >
                4to Prompt
              </span>
            </div>
            <p
              className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              The premium AI image prompt gallery. Discover, copy, and get inspired
              by thousands of curated prompts for Midjourney, DALL·E, and more.
            </p>
            <div className="flex items-center gap-3">
              <SocialLink href="https://github.com" label="GitHub" icon={<RiGithubLine size={18} />} />
              <SocialLink href="https://twitter.com" label="Twitter / X" icon={<RiTwitterXLine size={18} />} />
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <h3
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--color-text-faint)" }}
              >
                {title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {items.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm transition-colors duration-150
                                 hover:text-[var(--color-primary)]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-12 pt-6"
          style={{ borderTop: "1px solid var(--color-divider)" }}
        >
          <p
            className="text-xs flex items-center gap-1.5"
            style={{ color: "var(--color-text-faint)" }}
          >
            © {new Date().getFullYear()} 4to Prompt. Made with
            <RiHeartFill size={12} style={{ color: "var(--color-accent)" }} />
            for AI creators.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-text-faint)" }}>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href, label, icon,
}: {
  href: string; label: string; icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-lg flex items-center justify-center
                 border border-white/8 hover:border-[var(--color-border-hover)]
                 hover:text-[var(--color-primary)] transition-all duration-200"
      style={{ color: "var(--color-text-muted)" }}
    >
      {icon}
    </a>
  );
}