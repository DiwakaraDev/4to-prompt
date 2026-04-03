// src/components/auth/AuthProvider.tsx
"use client";

import { useAuthListener } from "@/hooks/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthListener(); // Boots up the global auth listener
  return <>{children}</>;
}