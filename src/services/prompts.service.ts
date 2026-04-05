// src/services/prompts.service.ts

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  increment,
  getCountFromServer,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { deleteStorageFile } from "@/services/storage.service";
import { cache, TTL } from "@/lib/cache";
import type {
  Prompt,
  PaginationResult,
  PromptCategory,
  PromptType,
} from "@/types";

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────

const COL       = "prompts";
const PAGE_SIZE = 12;

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface FetchPromptsOptions {
  lastDoc?:      QueryDocumentSnapshot<DocumentData> | null;
  type?:         PromptType | "ALL";
  category?:     PromptCategory | "All";
  searchQuery?:  string;
}

export interface AddPromptInput {
  title:         string;
  promptText:    string;
  category:      PromptCategory;
  isPremium:     boolean;
  imageUrl:      string;
  createdBy:     string;
  createdByName: string;
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function docToPrompt(d: QueryDocumentSnapshot<DocumentData>): Prompt {
  return { id: d.id, ...d.data() } as Prompt;
}

// ─────────────────────────────────────────────────────────────────
// READ — Paginated fetch (home page / infinite scroll)
// ─────────────────────────────────────────────────────────────────

/**
 * Fetches a paginated, filtered list of prompts.
 * Supports:  type filter (FREE | PREMIUM | ALL)
 *            category filter
 *            cursor-based pagination (startAfter)
 *
 * NOTE: Mixing multiple where() + orderBy() requires composite
 * Firestore indexes (see firestore.indexes.json in Step 8.4).
 */
export async function fetchPrompts(
  options: FetchPromptsOptions = {},
): Promise<PaginationResult<Prompt>> {
  const { lastDoc, type = "ALL", category = "All" } = options;

  const isIndexError = (err: unknown) => {
    if (!err || typeof err !== "object") return false;
    const maybeErr = err as { code?: string; message?: string };
    const code = typeof maybeErr.code === "string" ? maybeErr.code : "";
    const message = typeof maybeErr.message === "string" ? maybeErr.message : "";
    return code === "failed-precondition" || message.toLowerCase().includes("index");
  };

  // Build constraint array dynamically
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraints: any[] = [];

  if (type === "FREE")    constraints.push(where("isPremium", "==", false));
  if (type === "PREMIUM") constraints.push(where("isPremium", "==", true));
  if (category !== "All") constraints.push(where("category", "==", category));

  const orderedConstraints = [...constraints, orderBy("createdAt", "desc")];
  if (lastDoc) orderedConstraints.push(startAfter(lastDoc));

  // Fetch one extra to determine hasMore
  orderedConstraints.push(limit(PAGE_SIZE + 1));

  try {
    const snap = await getDocs(query(collection(db, COL), ...orderedConstraints));
    const docs = snap.docs;

    const hasMore = docs.length > PAGE_SIZE;
    const data    = docs.slice(0, PAGE_SIZE).map(docToPrompt);

    return {
      data,
      lastDoc:  hasMore ? docs[PAGE_SIZE - 1] : null,
      hasMore,
    };
  } catch (err) {
    if (!isIndexError(err)) throw err;

    // Fallback when composite index is missing: drop orderBy/startAfter.
    // Pagination is disabled in this mode.
    console.warn("Missing Firestore index for prompts query; using fallback.");

    const fallbackConstraints = [...constraints, limit(PAGE_SIZE)];
    const snap = await getDocs(query(collection(db, COL), ...fallbackConstraints));
    const data = snap.docs.map(docToPrompt);

    return {
      data,
      lastDoc: null,
      hasMore: false,
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// READ — Single prompt by ID (with cache)
// ─────────────────────────────────────────────────────────────────

/**
 * Fetches a single prompt by its Firestore document ID.
 * Results are cached for TTL.PROMPT ms (5 minutes by default).
 */
export async function fetchPromptById(id: string): Promise<Prompt | null> {
  const cacheKey = `prompt:${id}`;
  const cached   = cache.get<Prompt>(cacheKey);
  if (cached) return cached;

  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;

  const prompt = { id: snap.id, ...snap.data() } as Prompt;
  cache.set(cacheKey, prompt, TTL.PROMPT);
  return prompt;
}

// ─────────────────────────────────────────────────────────────────
// READ — All prompts for admin table (no pagination)
// ─────────────────────────────────────────────────────────────────

/**
 * Fetches ALL prompts ordered by creation date descending.
 * Used in the admin panel only — no pagination, no cache.
 */
export async function fetchAllPromptsAdmin(): Promise<Prompt[]> {
  const q    = query(collection(db, COL), orderBy("createdAt", "desc"), limit(100));
  const snap = await getDocs(q);
  return snap.docs.map(docToPrompt);
}

// ─────────────────────────────────────────────────────────────────
// READ — Search prompts by title (client-side filter on fetched set)
// ─────────────────────────────────────────────────────────────────

/**
 * Searches prompts by title using a case-insensitive client-side filter.
 * Firestore does not support full-text search natively; for production
 * scale, replace this with Algolia or Typesense.
 *
 * Fetches up to 200 latest prompts, then filters locally.
 */
export async function searchPrompts(searchQuery: string): Promise<Prompt[]> {
  if (!searchQuery.trim()) return [];

  const q = query(
    collection(db, COL),
    orderBy("createdAt", "desc"),
    limit(200),
  );
  const snap  = await getDocs(q);
  const lower = searchQuery.toLowerCase();

  return snap.docs
    .map(docToPrompt)
    .filter(
      p =>
        p.title.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower) ||
        p.promptText.toLowerCase().includes(lower),
    );
}

// ─────────────────────────────────────────────────────────────────
// READ — Total count (dashboard stats)
// ─────────────────────────────────────────────────────────────────

/**
 * Returns the total number of prompts.
 * Uses Firestore's getCountFromServer — very cheap (1 read).
 */
export async function getPromptsCount(): Promise<number> {
  const snap = await getCountFromServer(collection(db, COL));
  return snap.data().count;
}

/**
 * Returns the number of premium prompts.
 */
export async function getPremiumPromptsCount(): Promise<number> {
  const snap = await getCountFromServer(
    query(collection(db, COL), where("isPremium", "==", true)),
  );
  return snap.data().count;
}

// ─────────────────────────────────────────────────────────────────
// CREATE — Add new prompt
// ─────────────────────────────────────────────────────────────────

/**
 * Creates a new prompt document in Firestore.
 * Returns the new document ID.
 */
export async function addPrompt(input: AddPromptInput): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    title:         input.title,
    promptText:    input.promptText,
    category:      input.category,
    isPremium:     input.isPremium,
    imageUrl:      input.imageUrl,
    createdBy:     input.createdBy,
    createdByName: input.createdByName,
    likesCount:    0,
    createdAt:     serverTimestamp(),
  });

  // Invalidate any cached prompt lists
  cache.invalidate("prompts:");

  return ref.id;
}

// ─────────────────────────────────────────────────────────────────
// UPDATE — Edit prompt fields
// ─────────────────────────────────────────────────────────────────

/**
 * Partially updates a prompt document.
 * Automatically invalidates the prompt cache entry.
 */
export async function updatePrompt(
  id:   string,
  data: Partial<
    Pick<Prompt, "title" | "promptText" | "category" | "isPremium" | "imageUrl">
  >,
): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data });

  // Invalidate stale cache
  cache.invalidate(`prompt:${id}`);
  cache.invalidate("prompts:");
}

// ─────────────────────────────────────────────────────────────────
// DELETE — Remove prompt + its Storage image
// ─────────────────────────────────────────────────────────────────

/**
 * Deletes a prompt document from Firestore AND its image from
 * Firebase Storage. Both operations are attempted; Storage deletion
 * failure is swallowed (image may already be gone).
 */
export async function deletePrompt(id: string): Promise<void> {
  // Fetch imageUrl before deleting the document
  const snap = await getDoc(doc(db, COL, id));
  const imageUrl: string | undefined = snap.data()?.imageUrl;

  // Delete Firestore document
  await deleteDoc(doc(db, COL, id));

  // Delete Storage image (best-effort)
  if (imageUrl) {
    await deleteStorageFile(imageUrl);
  }

  // Invalidate cache
  cache.invalidate(`prompt:${id}`);
  cache.invalidate("prompts:");
}

// ─────────────────────────────────────────────────────────────────
// LIKE SYSTEM
// ─────────────────────────────────────────────────────────────────

/**
 * Atomically increments the likesCount by 1.
 * The likes collection tracks which users liked which prompts
 * to prevent duplicate likes.
 */
export async function likePrompt(
  promptId: string,
  userId:   string,
): Promise<void> {
  // Record the like in a sub-collection for dedup
  const likeRef = doc(db, COL, promptId, "likes", userId);
  const exists  = await getDoc(likeRef);
  if (exists.exists()) return; // Already liked

  // Write like record + increment counter atomically via batch
  const { writeBatch } = await import("firebase/firestore");
  const batch = writeBatch(db);

  batch.set(likeRef, { userId, createdAt: serverTimestamp() });
  batch.update(doc(db, COL, promptId), { likesCount: increment(1) });

  await batch.commit();
  cache.invalidate(`prompt:${promptId}`);
}

/**
 * Atomically decrements the likesCount by 1.
 */
export async function unlikePrompt(
  promptId: string,
  userId:   string,
): Promise<void> {
  const likeRef = doc(db, COL, promptId, "likes", userId);
  const exists  = await getDoc(likeRef);
  if (!exists.exists()) return; // Not liked

  const { writeBatch } = await import("firebase/firestore");
  const batch = writeBatch(db);

  batch.delete(likeRef);
  batch.update(doc(db, COL, promptId), { likesCount: increment(-1) });

  await batch.commit();
  cache.invalidate(`prompt:${promptId}`);
}

/**
 * Checks whether a given user has liked a prompt.
 * Returns true / false.
 */
export async function hasUserLikedPrompt(
  promptId: string,
  userId:   string,
): Promise<boolean> {
  const snap = await getDoc(doc(db, COL, promptId, "likes", userId));
  return snap.exists();
}

// ─────────────────────────────────────────────────────────────────
// TOGGLE PREMIUM (admin shortcut)
// ─────────────────────────────────────────────────────────────────

/**
 * Toggles the isPremium flag on a prompt.
 * Convenience wrapper around updatePrompt.
 */
export async function togglePromptPremium(
  id:        string,
  isPremium: boolean,
): Promise<void> {
  await updatePrompt(id, { isPremium });
}