// src/store/auth.store.ts
import { create } from "zustand";
import type { AuthState } from "@/types";

export const useAuthStore = create<AuthState>((set) => ({
  user:    null,
  loading: true,
  setUser:    (user)    => set({ user }),
  setLoading: (loading) => set({ loading }),
}));