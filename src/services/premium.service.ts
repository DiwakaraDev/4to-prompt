// src/services/premium.service.ts
"use client";

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
import { db } from "@/firebase/config";
import type { PaymentRequest, PaymentStatus } from "@/types";

const PAYMENT_COL = "paymentRequests";
const USERS_COL   = "users";

// ── How much to charge (shown in UI) ──────────────────────────
export const PREMIUM_PRICE_LKR = 500;   // change to your currency/amount
export const ADMIN_WHATSAPP    = "94XXXXXXXXX"; // your WhatsApp number with country code, no +

// ── Duration ────────────────────────────────────────────────
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// ─────────────────────────────────────────────────────────────
// Check if user is currently premium
// ─────────────────────────────────────────────────────────────

export function isPremiumActive(premiumUntil?: Timestamp | null): boolean {
  if (!premiumUntil) return false;
  return premiumUntil.toDate().getTime() > Date.now();
}

export function premiumExpiryLabel(premiumUntil?: Timestamp | null): string {
  if (!premiumUntil) return "Not active";
  const d = premiumUntil.toDate();
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
  // Check for existing pending request to prevent duplicates
  const q = query(
    collection(db, PAYMENT_COL),
    where("userId",  "==", userId),
    where("status",  "==", "pending"),
  );
  const existing = await getDocs(q);
  if (!existing.empty) {
    return existing.docs[0].id; // return existing request id
  }

  const ref = doc(collection(db, PAYMENT_COL));
  await setDoc(ref, {
    userId,
    userName,
    userEmail,
    status:      "pending",
    requestedAt: serverTimestamp(),
    approvedAt:  null,
    approvedBy:  null,
    premiumUntil: null,
    note:        "",
  });

  return ref.id;
}

// ─────────────────────────────────────────────────────────────
// User: check if they have a pending request
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
// ─────────────────────────────────────────────────────────────

export async function fetchPaymentRequests(
  status?: PaymentStatus,
): Promise<PaymentRequest[]> {
  const constraints = status
    ? [where("status", "==", status), orderBy("requestedAt", "desc")]
    : [orderBy("requestedAt", "desc")];

  const snap = await getDocs(
    query(collection(db, PAYMENT_COL), ...constraints),
  );

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PaymentRequest);
}

// ─────────────────────────────────────────────────────────────
// Admin: approve a payment request → unlock user premium
// ─────────────────────────────────────────────────────────────

export async function approvePaymentRequest(
  requestId: string,
  adminUid:  string,
): Promise<void> {
  const requestRef = doc(db, PAYMENT_COL, requestId);
  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) throw new Error("Request not found");

  const data = requestSnap.data();
  const userId = data.userId as string;

  const premiumUntil = Timestamp.fromMillis(Date.now() + ONE_YEAR_MS);

  // Update payment request
  await updateDoc(requestRef, {
    status:      "approved",
    approvedAt:  serverTimestamp(),
    approvedBy:  adminUid,
    premiumUntil,
  });

  // Update user's premium status
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
// Admin: manually grant premium to any user (bypass request)
// ─────────────────────────────────────────────────────────────

export async function grantPremium(userId: string, adminUid: string): Promise<void> {
  const premiumUntil = Timestamp.fromMillis(Date.now() + ONE_YEAR_MS);

  await updateDoc(doc(db, USERS_COL, userId), {
    isPremium:   true,
    premiumUntil,
  });

  // Log it as an approved request
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
// Admin: revoke premium from a user
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
    `Please activate my premium access. Thank you!`
  );

  return `https://wa.me/${ADMIN_WHATSAPP}?text=${message}`;
}