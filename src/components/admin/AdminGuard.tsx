// src/components/admin/AdminGuard.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  RiShieldUserLine,
} from "react-icons/ri";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user)              router.replace("/login");
      else if (user.role !== "admin") router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center"
        style={{ background: "var(--color-bg)" }}>
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--color-primary-muted)" }}>
            <RiShieldUserLine size={20} style={{ color: "var(--color-primary)" }} />
          </div>
          <div className="w-6 h-6 border-2 border-white/10 border-t-[var(--color-primary)]
                          rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return <>{children}</>;
}