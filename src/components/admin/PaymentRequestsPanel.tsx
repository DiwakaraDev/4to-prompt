// src/components/admin/PaymentRequestsPanel.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RiCheckLine,
  RiCloseLine,
  RiVipCrownLine,
  RiTimeLine,
  RiShieldLine,
  RiAlertLine,
  RiArrowGoBackLine,
} from "react-icons/ri";
import { cn } from "@/lib/utils";
import {
  fetchPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
  revokeApproval,
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

// ── Confirmation dialog ──────────────────────────────────────
interface ConfirmDialogProps {
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function RevokeConfirmDialog({
  userName,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,6,12,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6"
        style={{
          background: "rgba(20,15,25,0.98)",
          border: "1px solid rgba(248,113,113,0.2)",
        }}
      >
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(248,113,113,0.12)",
              border: "1px solid rgba(248,113,113,0.25)",
            }}
          >
            <RiAlertLine size={26} style={{ color: "#fca5a5" }} />
          </div>
        </div>

        <h3 className="mb-2 text-center text-base font-bold text-white">
          Revoke Premium Access?
        </h3>

        <p
          className="mb-1 text-center text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          This will immediately lock all premium prompts for:
        </p>

        <p
          className="mb-5 text-center text-sm font-semibold"
          style={{ color: "#fca5a5" }}
        >
          {userName}
        </p>

        <div
          className="mb-5 rounded-2xl p-3 text-xs"
          style={{
            background: "rgba(248,113,113,0.06)",
            border: "1px solid rgba(248,113,113,0.12)",
            color: "var(--color-text-muted)",
          }}
        >
          <p>• User loses access to all premium prompts instantly</p>
          <p>• Payment request reverts to "Pending"</p>
          <p>• You can re-approve after verifying payment</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl py-2.5 text-sm font-semibold transition-colors hover:bg-white/5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--color-text-muted)",
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 rounded-2xl py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
            style={{
              background: "rgba(248,113,113,0.15)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "#fca5a5",
            }}
          >
            Yes, Revoke
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main panel ───────────────────────────────────────────────
export function PaymentRequestsPanel() {
  const user = useAuthStore((s) => s.user);

  const [requests, setRequests]     = useState<PaymentRequest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<PaymentStatus | "all">("pending");
  const [actionId, setActionId]     = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<PaymentRequest | null>(null);

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

  const handleRevokeConfirm = async () => {
    if (!user || !revokeTarget) return;
    const target = revokeTarget;
    setRevokeTarget(null);
    setActionId(target.id);
    try {
      await revokeApproval(target.id, user.uid);
      toast.success(`Premium revoked for ${target.userName}`);
      await loadRequests();
    } catch {
      toast.error("Failed to revoke premium");
    } finally {
      setActionId(null);
    }
  };

  return (
    <>
      {/* Revoke confirmation dialog */}
      {revokeTarget && (
        <RevokeConfirmDialog
          userName={revokeTarget.userName}
          onConfirm={handleRevokeConfirm}
          onCancel={() => setRevokeTarget(null)}
        />
      )}

      <div>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Payment Requests</h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Approve to activate 1-year premium for users
            </p>
          </div>
          <button
            onClick={loadRequests}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/8 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                tab === t.value
                  ? "bg-[rgba(188,103,255,0.15)] text-[var(--color-primary)] border border-[rgba(188,103,255,0.3)]"
                  : "border border-white/[0.08] bg-white/[0.03] text-[var(--color-text-muted)] hover:bg-white/[0.05]",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 w-full rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <RiVipCrownLine
              size={40}
              style={{ color: "var(--color-text-faint)" }}
            />
            <p
              className="mt-3 text-sm"
              style={{ color: "var(--color-text-faint)" }}
            >
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

                  {/* User info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">
                        {req.userName}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>

                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {req.userEmail}
                    </p>

                    <p
                      className="mt-1 text-[10px] font-mono"
                      style={{ color: "var(--color-text-faint)" }}
                    >
                      ID: {req.id}
                    </p>

                    <div
                      className="mt-2 flex items-center gap-1 text-xs"
                      style={{ color: "var(--color-text-faint)" }}
                    >
                      <RiTimeLine size={12} />
                      <span>
                        Requested:{" "}
                        {req.requestedAt
                          ? new Date(
                              req.requestedAt.seconds * 1000,
                            ).toLocaleString()
                          : "—"}
                      </span>
                    </div>

                    {req.premiumUntil && (
                      <div
                        className="mt-1 flex items-center gap-1 text-xs"
                        style={{ color: "#f5c842" }}
                      >
                        <RiShieldLine size={12} />
                        <span>
                          Premium until:{" "}
                          {new Date(
                            req.premiumUntil.seconds * 1000,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {req.note && (
                      <p
                        className="mt-1 text-[11px] italic"
                        style={{ color: "var(--color-text-faint)" }}
                      >
                        Note: {req.note}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col gap-2">

                    {/* Pending → Approve + Reject */}
                    {req.status === "pending" && (
                      <>
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
                      </>
                    )}

                    {/* Approved → Revoke button */}
                    {req.status === "approved" && (
                      <button
                        onClick={() => setRevokeTarget(req)}
                        disabled={actionId === req.id}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold",
                          "border border-orange-400/20 bg-orange-500/10 text-orange-300",
                          "transition-opacity hover:opacity-90 disabled:opacity-50",
                        )}
                      >
                        <RiArrowGoBackLine size={13} />
                        Revoke
                      </button>
                    )}

                    {/* Rejected → Re-approve option */}
                    {req.status === "rejected" && (
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
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── Status badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: PaymentStatus }) {
  const config = {
    pending: {
      label:  "Pending",
      bg:     "rgba(245,200,66,0.12)",
      color:  "#f5c842",
      border: "rgba(245,200,66,0.2)",
    },
    approved: {
      label:  "Approved",
      bg:     "rgba(110,231,183,0.1)",
      color:  "#6ee7b7",
      border: "rgba(110,231,183,0.2)",
    },
    rejected: {
      label:  "Rejected",
      bg:     "rgba(252,165,165,0.1)",
      color:  "#fca5a5",
      border: "rgba(252,165,165,0.2)",
    },
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