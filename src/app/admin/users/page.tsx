// src/app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { AppUser } from "@/types";
import { RiShieldUserLine, RiUserLine, RiSearchLine } from "react-icons/ri";

export default function AdminUsersPage() {
  const [users,    setUsers]    = useState<AppUser[]>([]);
  const [filtered, setFiltered] = useState<AppUser[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    getDocs(q).then(snap => {
      const data = snap.docs.map(d => d.data() as AppUser);
      setUsers(data);
      setFiltered(data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = search.toLowerCase();
    setFiltered(t
      ? users.filter(u =>
          u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t))
      : users
    );
  }, [search, users]);

  async function toggleRole(user: AppUser) {
    const newRole = user.role === "admin" ? "user" : "admin";
    if (newRole === "admin" &&
        !confirm(`Grant admin access to ${user.name}? They will have full control.`)) return;

    setToggling(user.uid);
    try {
      await updateDoc(doc(db, "users", user.uid), { role: newRole });
      setUsers(prev =>
        prev.map(u => u.uid === user.uid ? { ...u, role: newRole } : u)
      );
      toast.success(`${user.name} is now ${newRole === "admin" ? "an Admin" : "a User"}.`);
    } catch {
      toast.error("Failed to update role.");
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">

      <div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xl)", fontWeight: 800,
        }}>
          Users
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {users.length} registered users
        </p>
      </div>

      <div className="relative max-w-sm">
        <RiSearchLine size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--color-text-faint)" }} />
        <input type="search" value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="input pl-9" aria-label="Search users" />
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col gap-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="skeleton skeleton-avatar" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="skeleton" style={{ height: "12px", width: "30%" }} />
                  <div className="skeleton" style={{ height: "10px", width: "50%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["User", "Email", "Role", "Joined", "Action"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
                      style={{ color: "var(--color-text-faint)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.uid}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Avatar + Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                        text-xs font-bold"
                          style={{
                            background: u.role === "admin"
                              ? "rgba(188,103,255,0.15)" : "rgba(255,255,255,0.06)",
                            color: u.role === "admin"
                              ? "var(--color-primary)" : "var(--color-text-muted)",
                          }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium max-w-[140px] truncate"
                          style={{ color: "var(--color-text)" }}>
                          {u.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-[180px]">
                      <span className="text-xs truncate block"
                        style={{ color: "var(--color-text-muted)" }}>
                        {u.email}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={cn("badge", u.role === "admin" ? "badge-primary" : "badge-secondary")}>
                        {u.role === "admin"
                          ? <><RiShieldUserLine size={10} />Admin</>
                          : <><RiUserLine size={10} />User</>}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs"
                      style={{ color: "var(--color-text-muted)" }}>
                      {u.createdAt ? formatDate(u.createdAt) : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRole(u)}
                        disabled={toggling === u.uid}
                        className={cn(
                          "btn btn-sm transition-all",
                          u.role === "admin" ? "btn-ghost" : "btn-secondary"
                        )}
                        style={{ minHeight: "28px", padding: "4px 12px", fontSize: "11px" }}
                      >
                        {toggling === u.uid
                          ? <span className="w-3 h-3 border border-current/30 border-t-current
                                             rounded-full animate-spin" />
                          : u.role === "admin" ? "Revoke Admin" : "Make Admin"
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}