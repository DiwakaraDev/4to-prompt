// src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/services/auth.service";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  RiMenuLine, RiCloseLine, RiUserLine,
  RiLogoutBoxLine, RiDashboardLine,
  RiImageLine, RiShieldUserLine,
} from "react-icons/ri";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/",         label: "Explore"  },
  { href: "/#free",    label: "Free"     },
  { href: "/#premium", label: "✦ Premium" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="4to Prompt home">
      <div className="relative">
        <svg width="34" height="34" viewBox="0 0 36 36" fill="none" aria-hidden="true"
          className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <rect width="36" height="36" rx="10" fill="url(#navLogoGrad)" />
          <path d="M11 13.5L18 9.5L25 13.5V22.5L18 26.5L11 22.5Z"
            stroke="white" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <circle cx="18" cy="18" r="2.5" fill="white" opacity="0.95" />
          <defs>
            <linearGradient id="navLogoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#bc67ff" />
              <stop offset="0.5" stopColor="#7c3af5" />
              <stop offset="1" stopColor="#00c8ff" />
            </linearGradient>
          </defs>
        </svg>
        {/* Glow dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--color-secondary)]
                         border-2 border-[var(--color-bg)] animate-pulse" />
      </div>
      <div className="hidden sm:flex flex-col leading-none">
        <span style={{
          fontFamily: "var(--font-display)", fontSize: "1rem",
          fontWeight: 800, letterSpacing: "-0.02em",
        }} className="gradient-text-primary">
          4to Prompt
        </span>
        <span style={{ fontSize: "0.6rem", color: "var(--color-text-faint)",
          letterSpacing: "0.08em", textTransform: "uppercase" }}>
          AI Gallery
        </span>
      </div>
    </Link>
  );
}

export function Navbar() {
  const { user, loading } = useAuth();
  const pathname          = usePathname();
  const router            = useRouter();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  async function handleLogout() {
    try {
      await logout();
      setProfileOpen(false);
      toast.success("Signed out.");
      router.push("/");
    } catch {
      toast.error("Sign out failed.");
    }
  }

  return (
    <>
      <header
        role="banner"
        className={cn(
          "fixed top-0 left-0 right-0 z-[200] transition-all duration-300",
          scrolled
            ? "glass-nav shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            : "glass-nav"
        )}
        style={{ height: "56px" }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(188,103,255,0.5), rgba(0,242,255,0.3), transparent)",
          }}
        />

        <div className="container h-full flex items-center justify-between gap-4">
          <Logo />

          {/* Desktop nav */}
          <nav role="navigation" aria-label="Main navigation"
            className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              const isPremium = label.includes("✦");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-white"
                      : isPremium
                      ? "hover:text-[var(--color-gold)]"
                      : "text-[var(--color-text-muted)] hover:text-white hover:bg-white/5"
                  )}
                  style={isPremium && !isActive
                    ? { color: "var(--color-gold)" }
                    : undefined
                  }
                >
                  {label}
                  {isActive && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: "var(--color-primary)" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2.5">
            {loading ? (
              <div className="skeleton skeleton-btn w-20 h-9" />
            ) : user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                  className={cn(
                    "flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl min-h-[44px]",
                    "border transition-all duration-200",
                    profileOpen
                      ? "border-[var(--color-border-hover)] bg-[var(--color-primary-muted)]"
                      : "border-white/8 hover:border-[var(--color-border-hover)] hover:bg-white/4"
                  )}
                >
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt={user.name}
                      width={28} height={28} className="rounded-lg" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: "var(--color-primary-muted)", color: "var(--color-primary)" }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:flex flex-col leading-none text-left">
                    <span className="text-xs font-semibold max-w-[90px] truncate"
                      style={{ color: "var(--color-text)" }}>
                      {user.name.split(" ")[0]}
                    </span>
                    {user.role === "admin" && (
                      <span className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--color-primary)" }}>
                        Admin
                      </span>
                    )}
                  </div>
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="glass-strong animate-scaleIn absolute right-0 top-full mt-2
                                  w-56 py-2 z-[300] origin-top-right">
                    {/* Profile header */}
                    <div className="px-4 py-3 mb-1"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs truncate mt-0.5"
                        style={{ color: "var(--color-text-muted)" }}>{user.email}</p>
                    </div>

                    <DropdownLink href="/profile" icon={<RiUserLine size={15} />} label="My Profile" />
                    {user.role === "admin" && (
                      <DropdownLink href="/admin/dashboard"
                        icon={<RiDashboardLine size={15} />} label="Admin Panel"
                        highlight />
                    )}

                    <div style={{ height: "1px", background: "rgba(255,255,255,0.05)",
                      margin: "6px var(--space-3)" }} />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                                 transition-colors duration-150 text-left rounded-lg mx-1"
                      style={{ color: "var(--color-error)", width: "calc(100% - 8px)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(240,80,80,0.08)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <RiLogoutBoxLine size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login"
                  className="hidden sm:inline-flex btn btn-ghost btn-sm"
                  style={{ borderColor: "rgba(255,255,255,0.10)" }}>
                  Sign In
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm"
                  style={{ paddingInline: "var(--space-5)" }}>
                  Get Started
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center
                         border border-white/8 hover:border-white/15 hover:bg-white/5
                         transition-all duration-200"
              style={{ color: "var(--color-text-muted)" }}
            >
              {mobileOpen
                ? <RiCloseLine size={20} />
                : <RiMenuLine size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[195] md:hidden bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        "glass-strong fixed top-[68px] left-3 right-3 z-[196] md:hidden rounded-2xl",
        "overflow-hidden transition-all duration-300 ease-out origin-top",
        mobileOpen
          ? "opacity-100 scale-y-100 pointer-events-auto"
          : "opacity-0 scale-y-95 pointer-events-none"
      )}>
        <nav aria-label="Mobile navigation" className="p-3 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isPremium = label.includes("✦");
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5
                           text-sm font-medium transition-colors"
                style={{ color: isPremium ? "var(--color-gold)" : "var(--color-text-muted)" }}>
                {isPremium ? <RiShieldUserLine size={17} /> : <RiImageLine size={17} />}
                {label}
              </Link>
            );
          })}

          {!user && (
            <div className="flex flex-col gap-2 mt-2 pt-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <Link href="/login" className="btn btn-ghost w-full">Sign In</Link>
              <Link href="/register" className="btn btn-primary w-full">Get Started</Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}

function DropdownLink({ href, icon, label, highlight }: {
  href: string; icon: React.ReactNode; label: string; highlight?: boolean;
}) {
  return (
    <Link href={href}
      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 mx-1 rounded-lg"
      style={{
        color: highlight ? "var(--color-primary)" : "var(--color-text-muted)",
        width: "calc(100% - 8px)",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {icon}{label}
    </Link>
  );
}