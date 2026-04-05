// src/services/premium.service.ts
"use client";

import { FirebaseError } from "firebase/app";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db }      from "@/firebase/config";
import type { PaymentRequest, PaymentStatus } from "@/types";
import type { FirebaseTimestamp } from "@/types";
import { toMs, toDate } from "@/lib/timestamp";

const PAYMENT_COL = "paymentRequests";
const USERS_COL   = "users";

// ── Pricing & contact ────────────────────────────────────────
export const PREMIUM_PRICE_LKR = 500;
export const ADMIN_WHATSAPP    = "94774204650";

// ── Duration ─────────────────────────────────────────────────
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// ─────────────────────────────────────────────────────────────
// Check if user is currently premium
// ─────────────────────────────────────────────────────────────

export function isPremiumActive(
  premiumUntil?: FirebaseTimestamp | null,
): boolean {
  return toMs(premiumUntil) > Date.now();
}

export function premiumExpiryLabel(
  premiumUntil?: FirebaseTimestamp | null,
): string {
  if (!premiumUntil) return "Not active";
  const d = toDate(premiumUntil);
  if (!d) return "Not active";
  if (d.getTime() < Date.now()) return "Expired";
  return `Valid until ${d.toLocaleDateString("en-US", {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  })}`;
}

// ─────────────────────────────────────────────────────────────
// User: submit payment request
// ─────────────────────────────────────────────────────────────

export async function submitPaymentRequest(
  userId:    string,
  userName:  string,
  userEmail: string,
): Promise<string> {
  // Prevent duplicate pending requests
  const q = query(
    collection(db, PAYMENT_COL),
    where("userId",  "==", userId),
    where("status",  "==", "pending"),
  );
  const existing = await getDocs(q);
  if (!existing.empty) return existing.docs[0].id;

  const ref = doc(collection(db, PAYMENT_COL));
  await setDoc(ref, {
    userId,
    userName,
    userEmail,
    status:       "pending",
    requestedAt:  serverTimestamp(),
    approvedAt:   null,
    approvedBy:   null,
    premiumUntil: null,
    note:         "",
  });

  return ref.id;
}

// ─────────────────────────────────────────────────────────────
// User: check their latest payment request status
// ─────────────────────────────────────────────────────────────

export async function getUserPaymentStatus(
  userId: string,
): Promise<PaymentStatus | null> {
  const q = query(
    collection(db, PAYMENT_COL),
    where("userId", "==", userId),
    orderBy("requestedAt", "desc"),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data().status as PaymentStatus;
}

// ─────────────────────────────────────────────────────────────
// Admin: fetch all payment requests
// Falls back to client-side sort if composite index is missing
// ─────────────────────────────────────────────────────────────

export async function fetchPaymentRequests(
  status?: PaymentStatus,
): Promise<PaymentRequest[]> {
  const colRef = collection(db, PAYMENT_COL);

  // ✅ toMs() handles both Timestamp and plain { seconds, nanoseconds }
  const sortByDate = (items: PaymentRequest[]) =>
    items.sort((a, b) => toMs(b.requestedAt) - toMs(a.requestedAt));

  try {
    const constraints = status
      ? [where("status", "==", status), orderBy("requestedAt", "desc")]
      : [orderBy("requestedAt", "desc")];

    const snap = await getDocs(query(colRef, ...constraints));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PaymentRequest);
  } catch (error) {
    // Graceful fallback when composite index is still building
    const isMissingIndex =
      error instanceof FirebaseError &&
      error.code === "failed-precondition" &&
      error.message.toLowerCase().includes("index");

    if (!isMissingIndex) throw error;

    const fallbackSnap = status
      ? await getDocs(query(colRef, where("status", "==", status)))
      : await getDocs(colRef);

    return sortByDate(
      fallbackSnap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as PaymentRequest,
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Admin: approve → unlock user premium for 1 year
// ─────────────────────────────────────────────────────────────

export async function approvePaymentRequest(
  requestId: string,
  adminUid:  string,
): Promise<void> {
  const requestRef  = doc(db, PAYMENT_COL, requestId);
  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) throw new Error("Request not found");

  const userId       = requestSnap.data().userId as string;
  const premiumUntil = Timestamp.fromMillis(Date.now() + ONE_YEAR_MS);

  await updateDoc(requestRef, {
    status:       "approved",
    approvedAt:   serverTimestamp(),
    approvedBy:   adminUid,
    premiumUntil,
    note:         "",
  });

  await updateDoc(doc(db, USERS_COL, userId), {
    isPremium:    true,
    premiumUntil,
  });
}

// ─────────────────────────────────────────────────────────────
// Admin: reject a payment request
// ─────────────────────────────────────────────────────────────

export async function rejectPaymentRequest(
  requestId: string,
  adminUid:  string,
  note?:     string,
): Promise<void> {
  await updateDoc(doc(db, PAYMENT_COL, requestId), {
    status:     "rejected",
    approvedAt: serverTimestamp(),
    approvedBy: adminUid,
    note:       note ?? "",
  });
}

// ─────────────────────────────────────────────────────────────
// Admin: revoke an approved request
// → reverts request to "pending" + locks user immediately
// ─────────────────────────────────────────────────────────────

export async function revokeApproval(
  requestId: string,
  adminUid:  string,
): Promise<void> {
  const requestRef  = doc(db, PAYMENT_COL, requestId);
  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) throw new Error("Request not found");

  const userId = requestSnap.data().userId as string;

  await updateDoc(requestRef, {
    status:       "pending",
    approvedAt:   null,
    approvedBy:   null,
    premiumUntil: null,
    note:         `Revoked by admin (${adminUid})`,
  });

  await updateDoc(doc(db, USERS_COL, userId), {
    isPremium:    false,
    premiumUntil: null,
  });
}

// ─────────────────────────────────────────────────────────────
// Admin: manually grant premium (bypass request flow)
// ─────────────────────────────────────────────────────────────

export async function grantPremium(
  userId:   string,
  adminUid: string,
): Promise<void> {
  const premiumUntil = Timestamp.fromMillis(Date.now() + ONE_YEAR_MS);

  await updateDoc(doc(db, USERS_COL, userId), {
    isPremium:    true,
    premiumUntil,
  });

  const ref = doc(collection(db, PAYMENT_COL));
  await setDoc(ref, {
    userId,
    userName:    "Manual Grant",
    userEmail:   "-",
    status:      "approved",
    requestedAt: serverTimestamp(),
    approvedAt:  serverTimestamp(),
    approvedBy:  adminUid,
    premiumUntil,
    note:        "Manually granted by admin",
  });
}

// ─────────────────────────────────────────────────────────────
// Admin: hard revoke premium (no request trail)
// ─────────────────────────────────────────────────────────────

export async function revokePremium(userId: string): Promise<void> {
  await updateDoc(doc(db, USERS_COL, userId), {
    isPremium:    false,
    premiumUntil: null,
  });
}

// ─────────────────────────────────────────────────────────────
// WhatsApp link builder
// ─────────────────────────────────────────────────────────────

export function buildWhatsAppLink(
  userId:    string,
  userEmail: string,
  requestId: string,
): string {
  const message = encodeURIComponent(
    `Hi, I've made the payment for 4to Prompt Premium.\n\n` +
    `📧 Email: ${userEmail}\n` +
    `🆔 User ID: ${userId}\n` +
    `🔖 Request ID: ${requestId}\n\n` +
    `Please activate my premium access. Thank you!`,
  );
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${message}`;
}