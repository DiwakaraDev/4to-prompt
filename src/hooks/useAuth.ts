// src/hooks/useAuth.ts
"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useAuthStore } from "@/store/auth.store";
import { fetchUserDocument, setAuthCookie } from "@/services/auth.service";

export function useAuthListener() {
  const setUser    = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setAuthCookie(token);
        const appUser = await fetchUserDocument(firebaseUser.uid);
        setUser(appUser);
      } else {
        setAuthCookie(null);
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [setUser, setLoading]);
}

export function useAuth() {
  return {
    user:    useAuthStore((s) => s.user),
    loading: useAuthStore((s) => s.loading),
  };
}