// src/types/index.ts

import { Timestamp } from "firebase/firestore";

// ─── User ───────────────────────────────────────────────────────
export type UserRole = "user" | "admin";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Timestamp;
}

// ─── Prompt ─────────────────────────────────────────────────────
export type PromptType = "FREE" | "PREMIUM";

export type PromptCategory =
  | "Anime"
  | "Fantasy"
  | "Sci-Fi"
  | "Portrait"
  | "Landscape"
  | "Architecture"
  | "Abstract"
  | "Other";

export interface Prompt {
  id: string;
  title: string;
  imageUrl: string;
  promptText: string;
  category: PromptCategory;
  isPremium: boolean;
  createdBy: string;        // uid
  createdByName: string;
  createdAt: Timestamp;
  likesCount: number;
}

// ─── Comment ────────────────────────────────────────────────────
export interface Comment {
  id: string;
  promptId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  text: string;
  createdAt: Timestamp;
}

// ─── Auth Store ─────────────────────────────────────────────────
export interface AuthState {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
}

// ─── Pagination ─────────────────────────────────────────────────
export interface PaginationResult<T> {
  data: T[];
  lastDoc: unknown;       // DocumentSnapshot
  hasMore: boolean;
}