// src/lib/timestamp.ts
import type { FirebaseTimestamp } from "@/types";

/**
 * Safely converts FirebaseTimestamp (either Firestore SDK Timestamp
 * or plain serialized { seconds, nanoseconds }) to milliseconds.
 * Use everywhere you need to compare or sort FirebaseTimestamp values.
 */
export function toMs(ts: FirebaseTimestamp | null | undefined): number {
  if (!ts) return 0;
  if (typeof (ts as { toMillis?: unknown }).toMillis === "function") {
    return (ts as { toMillis: () => number }).toMillis();
  }
  if (typeof (ts as { seconds?: unknown }).seconds === "number") {
    return (ts as { seconds: number }).seconds * 1000;
  }
  return 0;
}

/**
 * Safely converts FirebaseTimestamp to a JS Date.
 * Returns null if the timestamp is missing or unresolvable.
 */
export function toDate(ts: FirebaseTimestamp | null | undefined): Date | null {
  if (!ts) return null;
  if (typeof (ts as { toDate?: unknown }).toDate === "function") {
    return (ts as { toDate: () => Date }).toDate();
  }
  if (typeof (ts as { seconds?: unknown }).seconds === "number") {
    return new Date((ts as { seconds: number }).seconds * 1000);
  }
  return null;
}