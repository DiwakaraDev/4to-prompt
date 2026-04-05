// src/hooks/usePremium.ts
"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/store/auth.store";
import { isPremiumActive, premiumExpiryLabel } from "@/services/premium.service";

export function usePremium() {
  const user = useAuthStore((s) => s.user);

  const isActive = useMemo(
    () => isPremiumActive(user?.premiumUntil),
    [user?.premiumUntil],
  );

  const expiryLabel = useMemo(
    () => premiumExpiryLabel(user?.premiumUntil),
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