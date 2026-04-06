// src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { logout } from "@/services/auth.service";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  RiMenuLine, RiCloseLine, RiUserLine,
  RiLogoutBoxLine, RiDashboardLine,
} from "react-icons/ri";
import Image from "next/image";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="4to Prompt home">
      {/* Icon */}
      <div className="relative">
       
          <Image
            src="/logo_01.png"
            alt="4to Prompt logo"
            width={150}
            height={150}
            className="rounded-md object-cover"
            priority
          />
      
        {/* Animated pulse ring */}
        <span
          className="absolute inset-0 rounded-xl animate-ping opacity-5 pointer-events-none"
          style={{ background: "linear-gradient(135deg, #bc67ff, #00c8ff)" }}
        />
      </div>
    </Link>
  );
}

export function Navbar() {
  const { user, loading } = useAuth();
  const setUser           = useAuthStore((s) => s.setUser);
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
      setUser(null);
      setProfileOpen(false);
      toast.success("Signed out.");
      router.push("/");
    } catch {
      toast.error("Sign out failed.");
    }
  }

  return (
    <>
      <header role="banner" className="fixed top-0 left-0 right-0 z-[200]" style={{ height: "72px" }}>

        {/* ── Floating navbar pill ── */}
        <div
          className={cn(
            "absolute inset-x-5 top-3 rounded-2xl",
            "flex items-center justify-between px-10 py-8",
            "transition-all duration-500",
          )}
          style={{
            height:              "52px",
            background:          "transparent",
            backdropFilter:      "blur(24px) saturate(180%)",
            WebkitBackdropFilter:"blur(24px) saturate(180%)",
            border:              scrolled
              ? "1px solid rgba(188,103,255,0.28)"
              : "1px solid rgba(255,255,255,0.08)",
            boxShadow: scrolled
              ? `0 8px 40px rgba(0,0,0,0.6),
                 0 0 0 1px rgba(188,103,255,0.06),
                 inset 0 1px 0 rgba(255,255,255,0.05)`
              : `0 4px 24px rgba(0,0,0,0.3),
                 inset 0 1px 0 rgba(255,255,255,0.04)`,
          }}
        >
          {/* ── Top shimmer line ── */}
          <div
            className="absolute top-0 left-[5%] right-[5%] h-px rounded-full pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(188,103,255,0.7), rgba(0,242,255,0.5), transparent)",
              opacity: scrolled ? 1 : 0.6,
              transition: "opacity 0.5s",
            }}
          />

          {/* ── Bottom shimmer line ── */}
          <div
            className="absolute bottom-0 left-[15%] right-[15%] h-px rounded-full pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(188,103,255,0.15), transparent)",
            }}
          />

          <Logo />

          {/* ── Right section ── */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="skeleton w-28 h-9 rounded-xl" />
            ) : user ? (
              <div ref={profileRef} className="relative hidden md:block">
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                  className={cn(
                    "navbar-profile-btn flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-xl",
                    "transition-all duration-200",
                    profileOpen && "navbar-profile-btn-open",
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.name}
                        width={30}
                        height={30}
                        className="rounded-lg object-cover"
                        style={{ border: "1.5px solid rgba(188,103,255,0.4)" }}
                      />
                    ) : (
                      <div
                        className="w-[30px] h-[30px] rounded-lg flex items-center justify-center
                                   text-sm font-bold"
                        style={{
                          background: "linear-gradient(135deg, #bc67ff, #00c8ff)",
                          color:      "#fff",
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400"
                      style={{ border: "2px solid rgba(8,9,18,1)" }}
                    />
                  </div>

                  <div className="hidden sm:flex flex-col leading-none text-left">
                    <span className="text-xs font-semibold max-w-[90px] truncate"
                      style={{ color: "var(--color-text)" }}>
                      {user.name.split(" ")[0]}
                    </span>
                    {user.role === "admin" ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--color-primary)" }}>
                        Admin
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-wider"
                        style={{ color: "var(--color-text-faint)" }}>
                        Member
                      </span>
                    )}
                  </div>

                  {/* Chevron */}
                  <svg
                    width="12" height="12" viewBox="0 0 12 12" fill="none"
                    className={cn("transition-transform duration-200 ml-0.5", profileOpen && "rotate-180")}
                    style={{ color: "var(--color-text-faint)" }}
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* ── Dropdown ── */}
                {profileOpen && (
                  <div
                    className="animate-scaleIn absolute right-0 top-full mt-2.5 w-60
                               z-[300] origin-top-right rounded-2xl overflow-hidden"
                    style={{
                      background:           "rgba(10,11,20,0.97)",
                      backdropFilter:       "blur(28px) saturate(180%)",
                      WebkitBackdropFilter: "blur(28px) saturate(180%)",
                      border:               "1px solid rgba(188,103,255,0.22)",
                      boxShadow:            `0 20px 60px rgba(0,0,0,0.7),
                                             0 0 0 1px rgba(255,255,255,0.03),
                                             inset 0 1px 0 rgba(255,255,255,0.05)`,
                    }}
                  >
                    {/* Header */}
                    <div
                      className="relative px-4 py-4 overflow-hidden"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      {/* Glow bg */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: "radial-gradient(ellipse at top right, rgba(188,103,255,0.12), transparent 60%)",
                        }}
                      />
                      <div className="relative flex items-center gap-3">
                        {user.photoURL ? (
                          <Image
                            src={user.photoURL}
                            alt={user.name}
                            width={36}
                            height={36}
                            className="rounded-xl object-cover shrink-0"
                            style={{ border: "2px solid rgba(188,103,255,0.35)" }}
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center
                                       text-base font-bold shrink-0"
                            style={{
                              background: "linear-gradient(135deg, #bc67ff, #00c8ff)",
                              color:      "#fff",
                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate"
                            style={{ color: "var(--color-text)" }}>
                            {user.name}
                          </p>
                          <p className="text-xs truncate mt-0.5"
                            style={{ color: "var(--color-text-muted)" }}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-1.5 flex flex-col gap-0.5">
                      <DropdownLink
                        href="/profile"
                        icon={<RiUserLine size={14} />}
                        label="My Profile"
                      />
                      {user.role === "admin" && (
                        <DropdownLink
                          href="/admin/dashboard"
                          icon={<RiDashboardLine size={14} />}
                          label="Admin Panel"
                          highlight
                        />
                      )}

                      <div className="h-px my-1 mx-1"
                        style={{ background: "rgba(255,255,255,0.05)" }} />

                      <button
                        onClick={handleLogout}
                        className="navbar-logout-btn w-full flex items-center gap-2.5
                                   px-3 py-2.5 text-sm rounded-xl transition-colors text-left"
                        style={{ color: "var(--color-error)" }}
                      >
                        <RiLogoutBoxLine size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login" className="navbar-signin-btn hidden sm:inline-flex
                  items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200">
                  Sign In
                </Link>
                <Link href="/register" className="navbar-register-btn inline-flex
                  items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                  transition-all duration-200">
                  Get Started
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor"
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            )}

            {/* Hamburger — mobile only */}
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => {
                setProfileOpen(false);
                setMobileOpen(o => !o);
              }}
              className="md:hidden navbar-hamburger w-9 h-9 rounded-xl flex items-center
                         justify-center transition-all duration-200"
            >
              {mobileOpen ? <RiCloseLine size={18} /> : <RiMenuLine size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[195] md:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ── */}
      <div
        className={cn(
          "fixed top-[72px] left-4 right-4 z-[196] md:hidden rounded-2xl overflow-hidden",
          "transition-all duration-300 ease-out origin-top",
          mobileOpen
            ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-y-95 -translate-y-3 pointer-events-none",
        )}
        style={{
          background:           "rgba(10,11,20,0.98)",
          backdropFilter:       "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border:               "1px solid rgba(188,103,255,0.20)",
          boxShadow:            "0 24px 64px rgba(0,0,0,0.8)",
        }}
      >
        {user ? (
          <div className="p-4 flex flex-col gap-2">
            {/* Mobile user card */}
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-1"
              style={{
                background: "linear-gradient(135deg, rgba(188,103,255,0.10), rgba(0,200,255,0.06))",
                border:     "1px solid rgba(188,103,255,0.15)",
              }}
            >
              {user.photoURL ? (
                <Image src={user.photoURL} alt={user.name}
                  width={40} height={40}
                  className="rounded-xl object-cover"
                  style={{ border: "2px solid rgba(188,103,255,0.4)" }} />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base"
                  style={{ background: "linear-gradient(135deg, #bc67ff, #00c8ff)", color: "#fff" }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>
                  {user.name}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                  {user.email}
                </p>
              </div>
            </div>

            <Link href="/profile"
              className="mobile-drawer-link flex items-center gap-3 px-4 py-3 rounded-xl
                         text-sm font-medium transition-all duration-200">
              <RiUserLine size={16} />
              My Profile
            </Link>

            {user.role === "admin" && (
              <Link href="/admin/dashboard"
                className="mobile-drawer-link-admin flex items-center gap-3 px-4 py-3
                           rounded-xl text-sm font-medium transition-all duration-200">
                <RiDashboardLine size={16} />
                Admin Panel
              </Link>
            )}

            <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

            <button
              onClick={handleLogout}
              className="navbar-logout-btn flex items-center gap-3 px-4 py-3 rounded-xl
                         text-sm font-medium transition-all duration-200 text-left w-full"
              style={{ color: "var(--color-error)" }}
            >
              <RiLogoutBoxLine size={16} />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-2.5">
            <p className="text-xs text-center pb-1"
              style={{ color: "var(--color-text-faint)" }}>
              Join thousands of AI creators
            </p>
            <Link href="/login"    className="btn btn-ghost w-full">Sign In</Link>
            <Link href="/register" className="btn btn-primary w-full">Get Started →</Link>
          </div>
        )}
      </div>

      {/* ── Scoped styles ── */}
      <style>{`
        /* Profile button */
        .navbar-profile-btn {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: var(--color-text);
          min-height: 40px;
        }
        .navbar-profile-btn:hover,
        .navbar-profile-btn-open {
          border-color: rgba(188,103,255,0.35);
          background: rgba(188,103,255,0.08);
          box-shadow: 0 0 20px rgba(188,103,255,0.12);
        }

        /* Sign In */
        .navbar-signin-btn {
          color: var(--color-text-muted);
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
          min-height: 38px;
        }
        .navbar-signin-btn:hover {
          color: var(--color-text);
          border-color: rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.06);
        }

        /* Get Started */
        .navbar-register-btn {
          background: linear-gradient(135deg, #bc67ff 0%, #7c3af5 60%, #00c8ff 100%);
          color: #fff;
          box-shadow: 0 0 20px rgba(188,103,255,0.35), 0 4px 12px rgba(0,0,0,0.3);
          min-height: 38px;
        }
        .navbar-register-btn:hover {
          box-shadow: 0 0 32px rgba(188,103,255,0.55), 0 4px 16px rgba(0,0,0,0.4);
          transform: translateY(-1px);
        }
        .navbar-register-btn:active {
          transform: translateY(0);
        }

        /* Hamburger */
        .navbar-hamburger {
          color: var(--color-text-muted);
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
        }
        .navbar-hamburger:hover {
          color: var(--color-text);
          border-color: rgba(188,103,255,0.25);
          background: rgba(188,103,255,0.07);
        }

        /* Dropdown items */
        .navbar-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          font-size: 13px;
          border-radius: 10px;
          transition: background 150ms ease;
          text-decoration: none;
          color: var(--color-text-muted);
        }
        .navbar-dropdown-item:hover {
          background: rgba(255,255,255,0.05);
          color: var(--color-text);
        }
        .navbar-dropdown-item-highlight {
          color: var(--color-primary) !important;
        }
        .navbar-dropdown-item-highlight:hover {
          background: rgba(188,103,255,0.08) !important;
        }
        .navbar-logout-btn:hover {
          background: rgba(240,80,80,0.09);
        }

        /* Mobile drawer */
        .mobile-drawer-link {
          color: var(--color-text-muted);
        }
        .mobile-drawer-link:hover {
          color: var(--color-text);
          background: rgba(255,255,255,0.05);
        }
        .mobile-drawer-link-admin {
          color: var(--color-primary);
        }
        .mobile-drawer-link-admin:hover {
          background: rgba(188,103,255,0.08);
        }
      `}</style>
    </>
  );
}

function DropdownLink({
  href, icon, label, highlight,
}: {
  href: string; icon: React.ReactNode; label: string; highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "navbar-dropdown-item",
        highlight && "navbar-dropdown-item-highlight",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}