// src/components/layout/Footer.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  RiGithubLine, RiTwitterXLine, RiHeartFill,
  RiSparklingLine, RiArrowRightUpLine,
  RiMailLine, RiWhatsappLine,
} from "react-icons/ri";

export function Footer() {
  return (
    <footer role="contentinfo" className="relative overflow-hidden">

      {/* ── Ambient glow ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 20% 50%, rgba(188,103,255,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 50%, rgba(0,242,255,0.04) 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Top glow line ── */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(188,103,255,0.4) 30%, rgba(0,242,255,0.3) 70%, transparent 100%)",
        }}
      />

      <div
        style={{
          background: "linear-gradient(180deg, rgba(13,15,26,0.0) 0%, var(--color-bg) 100%)",
          borderTop:  "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="container">

          {/* ── CTA Banner ── */}
          <div
            className="relative overflow-hidden rounded-2xl px-8 py-8 my-10
                       flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{
              background: "linear-gradient(135deg, rgba(188,103,255,0.10) 0%, rgba(0,242,255,0.06) 100%)",
              border:     "1px solid rgba(188,103,255,0.18)",
              boxShadow:  "0 0 40px rgba(188,103,255,0.07), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div
              aria-hidden="true"
              className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: "rgba(0,242,255,0.06)", filter: "blur(40px)" }}
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full pointer-events-none"
              style={{ background: "rgba(188,103,255,0.08)", filter: "blur(32px)" }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <RiSparklingLine size={14} style={{ color: "var(--color-gold)" }} />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "var(--color-gold)" }}
                >
                  Premium Access
                </span>
              </div>
              <p
                className="font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize:   "var(--text-lg)",
                  color:      "var(--color-text)",
                }}
              >
                Unlock every premium prompt
              </p>
              <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                Unlimited access for LKR 500 / year
              </p>
            </div>

            <Link href="/profile" className="relative z-10 btn btn-gold btn-lg shrink-0 gap-2">
              Get Premium
              <RiArrowRightUpLine size={16} />
            </Link>
          </div>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pb-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
         
                  <Image
                    src="/logo_01.png"
                    alt="4to Prompt logo"
                    width={150}
                    height={150}
                    className="rounded-md object-cover"
                  />
                </div>
       

              <p
                className="text-sm leading-relaxed mb-6 max-w-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                The premium AI image prompt gallery. Discover, copy, and get inspired
                by thousands of curated prompts for Midjourney, DALL·E, and more.
              </p>

              <div className="flex items-center gap-2">
                <SocialLink href="https://github.com"  label="GitHub"      icon={<RiGithubLine size={16} />} />
                <SocialLink href="https://twitter.com" label="Twitter / X" icon={<RiTwitterXLine size={16} />} />
              </div>
            </div>

            {/* ── Contact ── */}
            <div>
              <h3
                className="text-xs font-bold uppercase tracking-widest mb-5"
                style={{ color: "var(--color-text-faint)" }}
              >
                Contact
              </h3>

              <ul className="flex flex-col gap-3">

                {/* Email */}
                <li>
                  <a
                    href="mailto:pathumisuru19@gmail.com"
                    className="footer-contact-link group inline-flex items-center gap-3"
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                 transition-all duration-200"
                      style={{
                        background: "rgba(188,103,255,0.08)",
                        border:     "1px solid rgba(188,103,255,0.18)",
                        color:      "var(--color-primary)",
                      }}
                    >
                      <RiMailLine size={14} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-text-faint)" }}>
                        Email
                      </p>
                      <p className="text-sm transition-colors duration-200 footer-contact-value"
                        style={{ color: "var(--color-text-muted)" }}>
                        pathumisuru19@gmail.com
                      </p>
                    </div>
                  </a>
                </li>

                {/* WhatsApp */}
                <li>
                  <a
                    href="https://wa.me/94774204650"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-contact-link footer-whatsapp group inline-flex items-center gap-3"
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                 transition-all duration-200"
                      style={{
                        background: "rgba(34,197,94,0.08)",
                        border:     "1px solid rgba(34,197,94,0.18)",
                        color:      "#4ade80",
                      }}
                    >
                      <RiWhatsappLine size={14} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-text-faint)" }}>
                        WhatsApp
                      </p>
                      <p className="text-sm transition-colors duration-200 footer-contact-value"
                        style={{ color: "var(--color-text-muted)" }}>
                        +94 77 420 4650
                      </p>
                    </div>
                  </a>
                </li>

              </ul>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p
              className="text-xs flex items-center gap-1.5"
              style={{ color: "var(--color-text-faint)" }}
            >
              © {new Date().getFullYear()} 4to Prompt. Made with
              <RiHeartFill size={11} style={{ color: "var(--color-accent)" }} />
              for AI creators.
            </p>

            <div className="flex items-center gap-1" style={{ color: "var(--color-text-faint)" }}>
              {["Privacy", "Terms"].map((label, i) => (
                <span key={label} className="flex items-center gap-1">
                  {i > 0 && (
                    <span className="w-px h-3 mx-1" style={{ background: "rgba(255,255,255,0.10)" }} />
                  )}
                  <Link
                    href={`/${label.toLowerCase()}`}
                    className="text-xs transition-colors duration-150 hover:text-[var(--color-primary)]"
                  >
                    {label}
                  </Link>
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Scoped CSS hover styles ── */}
      <style>{`
        .footer-social-btn {
          width: 36px; height: 36px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          color: var(--color-text-muted);
          transition: all 200ms cubic-bezier(0.16,1,0.3,1);
          text-decoration: none;
        }
        .footer-social-btn:hover {
          background: rgba(188,103,255,0.10);
          border-color: rgba(188,103,255,0.35);
          color: var(--color-primary);
          box-shadow: 0 0 16px rgba(188,103,255,0.15);
          transform: translateY(-2px);
        }
        .footer-contact-link { text-decoration: none; }
        .footer-contact-link:hover .footer-contact-value {
          color: var(--color-primary) !important;
        }
        .footer-whatsapp:hover .footer-contact-value {
          color: #4ade80 !important;
        }
      `}</style>
    </footer>
  );
}

function SocialLink({
  href, label, icon,
}: {
  href:  string;
  label: string;
  icon:  React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="footer-social-btn"
    >
      {icon}
    </a>
  );
}