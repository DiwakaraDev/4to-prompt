// src/hooks/usePremium.ts
"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/store/auth.store";
import { premiumExpiryLabel } from "@/services/premium.service";
import type { FirebaseTimestamp } from "@/types";

// ─── Local helper ────────────────────────────────────────────────────────────
// Accepts both Firestore Timestamp (has .toMillis()) and plain serialized
// { seconds, nanoseconds } — the latter arrives after server/client boundary
// crossing where Timestamp methods are stripped by JSON serialization.
function resolvePremiumActive(
  premiumUntil: FirebaseTimestamp | null | undefined,
): boolean {
  if (!premiumUntil) return false;

  // Firestore SDK Timestamp — has .toMillis()
  if (typeof (premiumUntil as { toMillis?: unknown }).toMillis === "function") {
    return (premiumUntil as { toMillis: () => number }).toMillis() > Date.now();
  }

  // Plain serialized form — { seconds: number; nanoseconds: number }
  if (typeof (premiumUntil as { seconds?: unknown }).seconds === "number") {
    return (premiumUntil as { seconds: number }).seconds * 1000 > Date.now();
  }

  return false;
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function usePremium() {
  const user = useAuthStore((s) => s.user);

  const isActive = useMemo(
    () => resolvePremiumActive(user?.premiumUntil),
    [user?.premiumUntil],
  );

  const expiryLabel = useMemo(
    () => premiumExpiryLabel(user?.premiumUntil as never),
    [user?.premiumUntil],
  );

  const isAdmin = user?.role === "admin";

  // Admins always bypass premium lock
  const canViewPremium = isAdmin || isActive;

  return {
    isActive,
    canViewPremium,
    expiryLabel,
    isAdmin,
    premiumUntil: user?.premiumUntil ?? null,
  };
}