// src/components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  RiDashboardLine, RiImageAddLine, RiImageLine,
  RiUserLine, RiChat3Line, RiLogoutBoxLine,
  RiMenuLine, RiCloseLine, RiArrowLeftLine,
  RiShieldUserLine,
} from "react-icons/ri";

const NAV = [
  { href: "/admin/dashboard", icon: <RiDashboardLine size={17} />, label: "Dashboard" },
  { href: "/admin/prompts",   icon: <RiImageLine     size={17} />, label: "Prompts"   },
  { href: "/admin/upload",    icon: <RiImageAddLine  size={17} />, label: "Add Prompt" },
  { href: "/admin/users",     icon: <RiUserLine      size={17} />, label: "Users"     },
  { href: "/admin/comments",  icon: <RiChat3Line     size={17} />, label: "Comments"  },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user } = useAuth();

  async function handleLogout() {
    await logout();
    toast.success("Signed out.");
    router.push("/");
  }

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 mb-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #bc67ff, #7c3af5)" }}>
            <RiShieldUserLine size={14} style={{ color: "#fff" }} />
          </div>
          <div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.8rem", fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--color-text)",
            }}>
              Admin Panel
            </div>
            <div style={{ fontSize: "0.6rem", color: "var(--color-text-faint)",
              letterSpacing: "0.06em", textTransform: "uppercase" }}>
              4to Prompt
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Close menu"
            className="p-1 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: "var(--color-text-faint)" }}>
            <RiCloseLine size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5" aria-label="Admin navigation">
        {NAV.map(({ href, icon, label }) => {
          const isActive = pathname === href ||
            (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium",
                "transition-all duration-150",
                isActive
                  ? "text-white"
                  : "text-[var(--color-text-muted)] hover:text-white hover:bg-white/5"
              )}
              style={isActive ? {
                background: "linear-gradient(135deg, rgba(188,103,255,0.18), rgba(188,103,255,0.08))",
                border:     "1px solid rgba(188,103,255,0.22)",
                color:      "var(--color-primary)",
              } : undefined}
            >
              <span style={isActive ? { color: "var(--color-primary)" } : undefined}>
                {icon}
              </span>
              {label}
              {isActive && (
                <span className="ml-auto w-1 h-1 rounded-full"
                  style={{ background: "var(--color-primary)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 mt-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
        {/* Back to site */}
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs
                                   text-[var(--color-text-faint)] hover:text-white
                                   hover:bg-white/5 transition-all duration-150 mb-1">
          <RiArrowLeftLine size={14} />
          Back to Site
        </Link>

        {/* User row */}
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold"
              style={{ background: "var(--color-primary-muted)", color: "var(--color-primary)" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate"
                style={{ color: "var(--color-text)" }}>{user.name}</div>
              <div className="text-[10px] truncate"
                style={{ color: "var(--color-text-faint)" }}>{user.email}</div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs
                     transition-all duration-150 font-medium"
          style={{ color: "var(--color-error)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(240,80,80,0.08)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <RiLogoutBoxLine size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin menu"
        className="md:hidden fixed top-4 left-4 z-[300] w-9 h-9 rounded-xl
                   flex items-center justify-center transition-all duration-200"
        style={{
          background: "var(--color-surface-2)",
          border:     "1px solid rgba(255,255,255,0.09)",
          color:      "var(--color-text-muted)",
        }}>
        <RiMenuLine size={17} />
      </button>

      {/* Desktop sidebar */}
      <aside
        aria-label="Admin sidebar"
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[220px] z-[200]"
        style={{
          background:   "rgba(12,14,24,0.95)",
          borderRight:  "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
        }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[290] bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile drawer */}
      <aside
        aria-label="Admin sidebar mobile"
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[240px] z-[295] md:hidden",
          "transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background:   "rgba(12,14,24,0.98)",
          borderRight:  "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px)",
        }}>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}