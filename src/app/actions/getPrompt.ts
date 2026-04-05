"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/firebase/admin";
import type { Prompt, AppUser } from "@/types";

// ── Converts Admin Firestore Timestamp → plain { seconds, nanoseconds }
//    so Next.js can serialize it across the server → client boundary.
function serializePrompt(data: Record<string, unknown>, id: string): Prompt {
  return {
    ...data,
    id,
    createdAt: data.createdAt
      ? {
          seconds: (data.createdAt as { _seconds: number })._seconds,
          nanoseconds: (data.createdAt as { _nanoseconds: number })
            ._nanoseconds,
        }
      : null,
  } as unknown as Prompt;
}

export async function getPromptSecure(
  promptId: string,
): Promise<Prompt | null> {
  // ── 1. Fetch prompt via Admin SDK ────────────────────────────
  const promptDoc = await adminDb.collection("prompts").doc(promptId).get();
  if (!promptDoc.exists) return null;

  const raw = promptDoc.data() as Record<string, unknown>;
  const prompt = serializePrompt(raw, promptDoc.id);

  // ── 2. Free prompt — no gate needed ─────────────────────────
  if (!prompt.isPremium) return prompt;

  // ── 3. Premium prompt — verify identity server-side ─────────
  const cookieStore = await cookies();
  const token = cookieStore.get("4to-auth-token")?.value;

  if (!token) {
    return { ...prompt, promptText: "" };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const userSnap = await adminDb.collection("users").doc(decoded.uid).get();

    if (!userSnap.exists) {
      return { ...prompt, promptText: "" };
    }

    const userData = userSnap.data() as AppUser;

    const isAdmin = userData.role === "admin";

    const isPremiumActive = userData.premiumUntil
      ? (userData.premiumUntil as { seconds: number }).seconds * 1000 >
        Date.now()
      : false;

    if (isAdmin || isPremiumActive) {
      return prompt; // ✅ Full access
    }
  } catch {
    // Token expired, revoked, or tampered
  }

  // ── 4. Free user on premium prompt — strip text ──────────────
  return { ...prompt, promptText: "" };
}
