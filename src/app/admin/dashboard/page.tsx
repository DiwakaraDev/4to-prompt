// src/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/firebase/config";
import { StatCard } from "@/components/admin/StatCard";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  RiImageLine, RiUserLine, RiChat3Line,
  RiVipCrownLine, RiArrowRightLine, RiImageAddLine,
} from "react-icons/ri";

interface Stats {
  totalPrompts:   number;
  freePrompts:    number;
  premiumPrompts: number;
  totalUsers:     number;
  totalComments:  number;
}

export default function AdminDashboard() {
  const { user }                = useAuth();
  const [stats, setStats]       = useState<Stats | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [prompts, users, comments, premium] = await Promise.all([
          getCountFromServer(collection(db, "prompts")),
          getCountFromServer(collection(db, "users")),
          getCountFromServer(collection(db, "comments")),
          getCountFromServer(
            (await import("firebase/firestore")).query(
              collection(db, "prompts"),
              (await import("firebase/firestore")).where("isPremium", "==", true),
            )
          ),
        ]);

        const total   = prompts.data().count;
        const prem    = premium.data().count;
        setStats({
          totalPrompts:   total,
          freePrompts:    total - prem,
          premiumPrompts: prem,
          totalUsers:     users.data().count,
          totalComments:  comments.data().count,
        });
      } catch {
        /* stats not critical */
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const STATS = stats ? [
    {
      label: "Total Prompts",   value: stats.totalPrompts,
      icon: <RiImageLine size={16} />,    accentColor: "var(--color-primary)",
    },
    {
      label: "Free Prompts",    value: stats.freePrompts,
      icon: <RiImageLine size={16} />,    accentColor: "var(--color-success)",
    },
    {
      label: "Premium Prompts", value: stats.premiumPrompts,
      icon: <RiVipCrownLine size={16} />, accentColor: "var(--color-gold)",
    },
    {
      label: "Total Users",     value: stats.totalUsers,
      icon: <RiUserLine size={16} />,     accentColor: "var(--color-secondary)",
    },
    {
      label: "Comments",        value: stats.totalComments,
      icon: <RiChat3Line size={16} />,    accentColor: "var(--color-accent)",
    },
  ] : [];

  const QUICK_ACTIONS = [
    {
      label: "Add New Prompt", desc: "Upload an image + prompt text",
      href: "/admin/upload", icon: <RiImageAddLine size={18} />,
      color: "var(--color-primary)",
    },
    {
      label: "Manage Prompts", desc: "Edit, delete, toggle premium",
      href: "/admin/prompts", icon: <RiImageLine size={18} />,
      color: "var(--color-secondary)",
    },
    {
      label: "Manage Users",   desc: "View all registered users",
      href: "/admin/users",   icon: <RiUserLine size={18} />,
      color: "var(--color-gold)",
    },
    {
      label: "Moderate Comments", desc: "Delete inappropriate comments",
      href: "/admin/comments",   icon: <RiChat3Line size={18} />,
      color: "var(--color-accent)",
    },
  ];

  return (
    <div className="flex flex-col gap-7 max-w-5xl">

      {/* Header */}
      <div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize:   "var(--text-xl)",
          fontWeight: 800,
        }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl" style={{ height: "104px" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {STATS.map(s => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: "var(--color-text-faint)" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(({ label, desc, href, icon, color }) => (
            <Link
              key={href}
              href={href}
              className="glass rounded-2xl p-4 flex items-center gap-4 group
                         hover:border-[rgba(188,103,255,0.25)] transition-all duration-200
                         hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}15`, color }}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                  {label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {desc}
                </div>
              </div>
              <RiArrowRightLine size={15}
                className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                style={{ color: "var(--color-text-faint)" }} />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}