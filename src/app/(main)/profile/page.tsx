// src/app/(main)/profile/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import {
  RiUserLine, RiMailLine, RiCalendarLine,
  RiShieldUserLine, RiSettings3Line,
} from "react-icons/ri";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirectTo=/profile");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[var(--color-primary)]
                        rounded-full animate-spin" />
      </div>
    );
  }

  const fields = [
    { icon: <RiUserLine  size={17} />, label: "Display Name", value: user.name         },
    { icon: <RiMailLine  size={17} />, label: "Email",         value: user.email        },
    { icon: <RiShieldUserLine size={17}/>, label: "Role",
      value: user.role === "admin" ? "Administrator" : "Member" },
    {
      icon: <RiCalendarLine size={17} />, label: "Member Since",
      value: user.createdAt ? formatDate(user.createdAt) : "—",
    },
  ];

  return (
    <div className="section">
      <div className="container max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <RiSettings3Line size={22} style={{ color: "var(--color-primary)" }} />
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700 }}>
            My Profile
          </h1>
        </div>

        {/* Avatar card */}
        <div className="glass rounded-3xl p-8 mb-6 animate-fadeInUp">
          <div className="flex items-center gap-6 flex-wrap">
            {user.photoURL ? (
              <Image src={user.photoURL} alt={user.name}
                width={80} height={80}
                className="rounded-2xl"
                style={{ border: "2px solid rgba(188,103,255,0.3)" }} />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center
                           text-2xl font-bold shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary-muted), var(--color-secondary-muted))",
                  border:     "2px solid rgba(188,103,255,0.3)",
                  color:      "var(--color-primary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700 }}>
                {user.name}
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`badge ${user.role === "admin" ? "badge-primary" : "badge-secondary"}`}>
                  {user.role === "admin" ? "✦ Admin" : "Member"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info fields */}
        <div className="glass rounded-3xl overflow-hidden animate-fadeInUp stagger-1">
          <div className="px-6 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-text-faint)" }}>
              Account Details
            </h3>
          </div>

          {fields.map(({ icon, label, value }, i) => (
            <div
              key={label}
              className="flex items-center gap-4 px-6 py-4"
              style={{
                borderBottom: i < fields.length - 1
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "none",
              }}
            >
              <span style={{ color: "var(--color-text-faint)" }}>{icon}</span>
              <div className="flex-1 flex items-center justify-between gap-4 flex-wrap">
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {label}
                </span>
                <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
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