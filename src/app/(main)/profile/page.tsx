// src/app/(main)/profile/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import { ProfileImageUpload } from "@/components/profile/ProfileImageUpload";
import { PremiumLockModal } from "@/components/prompts/PremiumLockModal";
import {
  RiUserLine,
  RiMailLine,
  RiCalendarLine,
  RiShieldUserLine,
  RiSettings3Line,
  RiVipCrownLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
} from "react-icons/ri";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { isActive, expiryLabel } = usePremium();
  const router = useRouter();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirectTo=/profile");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{
            border: "2px solid rgba(255,255,255,0.08)",
            borderTopColor: "var(--color-primary)",
          }}
        />
      </div>
    );
  }

  const fields = [
    {
      icon: <RiUserLine size={17} />,
      label: "Display Name",
      value: user.name,
    },
    {
      icon: <RiMailLine size={17} />,
      label: "Email",
      value: user.email,
    },
    {
      icon: <RiShieldUserLine size={17} />,
      label: "Role",
      value: user.role === "admin" ? "Administrator" : "Member",
    },
    {
      icon: <RiCalendarLine size={17} />,
      label: "Member Since",
      value: user.createdAt ? formatDate(user.createdAt) : "—",
    },
  ];

  return (
    <div className="section">
      <div className="container max-w-2xl mx-auto">

        {/* ── Page header ──────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <RiSettings3Line size={22} style={{ color: "var(--color-primary)" }} />
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: 700,
            }}
          >
            My Profile
          </h1>
        </div>

        {/* ── Avatar + identity card ────────────────────────── */}
        <div className="glass rounded-3xl p-8 mb-6 animate-fadeInUp">
          <div className="flex items-center gap-6 flex-wrap">

            {/* Profile image upload — replaces static avatar */}
            <ProfileImageUpload size="lg" showLabel={false} />

            <div className="flex-1 min-w-0">
              <h2
                className="truncate"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-lg)",
                  fontWeight: 700,
                }}
              >
                {user.name}
              </h2>

              <p
                className="text-sm mt-1 truncate"
                style={{ color: "var(--color-text-muted)" }}
              >
                {user.email}
              </p>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span
                  className={`badge ${
                    user.role === "admin" ? "badge-primary" : "badge-secondary"
                  }`}
                >
                  {user.role === "admin" ? "✦ Admin" : "Member"}
                </span>

                {user.role !== "admin" && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                    style={
                      isActive
                        ? {
                            background: "linear-gradient(135deg,#f5c842,#e0a800)",
                            color: "#1a1200",
                          }
                        : {
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "var(--color-text-faint)",
                          }
                    }
                  >
                    <RiVipCrownLine size={10} />
                    {isActive ? "Premium" : "Free Plan"}
                  </span>
                )}
              </div>

              <p
                className="mt-2 text-xs"
                style={{ color: "var(--color-text-faint)" }}
              >
                Click the photo to upload a new one
              </p>
            </div>
          </div>
        </div>

        {/* ── Premium status card (non-admins only) ─────────── */}
        {user.role !== "admin" && (
          <div
            className="rounded-3xl p-5 mb-6 animate-fadeInUp stagger-1"
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(135deg, rgba(245,200,66,0.07) 0%, rgba(224,168,0,0.04) 100%)",
                    border: "1px solid rgba(245,200,66,0.18)",
                  }
                : {
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }
            }
          >
            <div className="flex items-center justify-between flex-wrap gap-4">

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={
                    isActive
                      ? {
                          background: "rgba(245,200,66,0.15)",
                          border: "1px solid rgba(245,200,66,0.3)",
                        }
                      : {
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }
                  }
                >
                  <RiVipCrownLine
                    size={18}
                    style={{ color: isActive ? "#f5c842" : "var(--color-text-faint)" }}
                  />
                </div>

                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: isActive ? "#f5c842" : "var(--color-text)" }}
                  >
                    {isActive ? "Premium Active" : "Free Plan"}
                  </p>
                  <div
                    className="flex items-center gap-1 mt-0.5 text-xs"
                    style={{ color: "var(--color-text-faint)" }}
                  >
                    <RiTimeLine size={12} />
                    <span>{expiryLabel}</span>
                  </div>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-1.5">
                {isActive ? (
                  <>
                    <RiCheckboxCircleLine size={15} style={{ color: "#6ee7b7" }} />
                    <span className="text-xs font-medium" style={{ color: "#6ee7b7" }}>
                      All prompts unlocked
                    </span>
                  </>
                ) : (
                  <>
                    <RiCloseCircleLine size={15} style={{ color: "var(--color-text-faint)" }} />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "var(--color-text-faint)" }}
                    >
                      Premium prompts locked
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Upgrade CTA — only when not premium */}
            {!isActive && (
              <button
                onClick={() => setShowPremiumModal(true)}
                className="mt-4 w-full rounded-2xl py-2.5 text-sm font-bold text-[#1a1200] transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #f5c842, #e0a800)",
                }}
              >
                <RiVipCrownLine size={14} className="inline mr-1.5 -mt-0.5" />
                Upgrade to Premium
              </button>
            )}
          </div>
        )}
          {showPremiumModal && (
            <PremiumLockModal onClose={() => setShowPremiumModal(false)} />
          )}


        {/* ── Account details ───────────────────────────────── */}
        <div
          className="glass rounded-3xl overflow-hidden animate-fadeInUp stagger-2"
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <h3
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-text-faint)" }}
            >
              Account Details
            </h3>
          </div>

          {fields.map(({ icon, label, value }, i) => (
            <div
              key={label}
              className="flex items-center gap-4 px-6 py-4"
              style={{
                borderBottom:
                  i < fields.length - 1
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "none",
              }}
            >
              <span style={{ color: "var(--color-text-faint)" }}>{icon}</span>
              <div className="flex-1 flex items-center justify-between gap-4 flex-wrap">
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {label}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}