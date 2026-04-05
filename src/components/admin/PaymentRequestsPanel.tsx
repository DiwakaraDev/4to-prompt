// src/components/admin/PaymentRequestsPanel.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RiCheckLine,
  RiCloseLine,
  RiVipCrownLine,
  RiTimeLine,
  RiShieldLine,
} from "react-icons/ri";
import { cn } from "@/lib/utils";
import {
  fetchPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
} from "@/services/premium.service";
import { useAuthStore } from "@/store/auth.store";
import type { PaymentRequest, PaymentStatus } from "@/types";
import toast from "react-hot-toast";

const STATUS_TABS: { label: string; value: PaymentStatus | "all" }[] = [
  { label: "All",      value: "all"      },
  { label: "Pending",  value: "pending"  },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export function PaymentRequestsPanel() {
  const user = useAuthStore((s) => s.user);
  const [requests, setRequests]   = useState<PaymentRequest[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<PaymentStatus | "all">("pending");
  const [actionId, setActionId]   = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPaymentRequests(
        tab === "all" ? undefined : tab,
      );
      setRequests(data);
    } catch {
      toast.error("Failed to load payment requests");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (req: PaymentRequest) => {
    if (!user) return;
    setActionId(req.id);
    try {
      await approvePaymentRequest(req.id, user.uid);
      toast.success(`Premium activated for ${req.userName}`);
      await loadRequests();
    } catch {
      toast.error("Failed to approve");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (req: PaymentRequest) => {
    if (!user) return;
    setActionId(req.id);
    try {
      await rejectPaymentRequest(req.id, user.uid, "Payment not verified");
      toast.success("Request rejected");
      await loadRequests();
    } catch {
      toast.error("Failed to reject");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Payment Requests</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Approve to activate 1-year premium for users
          </p>
        </div>
        <button
          onClick={loadRequests}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
        >
          Refresh
        </button>
      </div>

      {/* tabs */}
      <div className="mb-6 flex gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-semibold transition-all",
              tab === t.value
                ? "bg-[rgba(188,103,255,0.15)] text-[var(--color-primary)] border border-[rgba(188,103,255,0.3)]"
                : "border border-white/8 bg-white/3 text-[var(--color-text-muted)] hover:bg-white/5",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton h-20 w-full rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <RiVipCrownLine size={40} style={{ color: "var(--color-text-faint)" }} />
          <p className="mt-3 text-sm" style={{ color: "var(--color-text-faint)" }}>
            No {tab === "all" ? "" : tab} payment requests
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                {/* user info */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {req.userName}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {req.userEmail}
                  </p>
                  <p className="mt-1 text-[10px] font-mono" style={{ color: "var(--color-text-faint)" }}>
                    ID: {req.id}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: "var(--color-text-faint)" }}>
                    <RiTimeLine size={12} />
                    <span>
                      Requested: {req.requestedAt
                        ? new Date(req.requestedAt.seconds * 1000).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  {req.premiumUntil && (
                    <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: "#f5c842" }}>
                      <RiShieldLine size={12} />
                      <span>
                        Premium until:{" "}
                        {new Date(req.premiumUntil.seconds * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* actions */}
                {req.status === "pending" && (
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      onClick={() => handleApprove(req)}
                      disabled={actionId === req.id}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold",
                        "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
                        "transition-opacity hover:opacity-90 disabled:opacity-50",
                      )}
                    >
                      <RiCheckLine size={13} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req)}
                      disabled={actionId === req.id}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold",
                        "border border-red-400/20 bg-red-500/10 text-red-300",
                        "transition-opacity hover:opacity-90 disabled:opacity-50",
                      )}
                    >
                      <RiCloseLine size={13} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const config = {
    pending:  { label: "Pending",  bg: "rgba(245,200,66,0.12)",  color: "#f5c842",      border: "rgba(245,200,66,0.2)"  },
    approved: { label: "Approved", bg: "rgba(110,231,183,0.1)",  color: "#6ee7b7",      border: "rgba(110,231,183,0.2)" },
    rejected: { label: "Rejected", bg: "rgba(252,165,165,0.1)",  color: "#fca5a5",      border: "rgba(252,165,165,0.2)" },
  }[status];

  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{
        background: config.bg,
        color:      config.color,
        border:     `1px solid ${config.border}`,
      }}
    >
      {config.label}
    </span>
  );
}