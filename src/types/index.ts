// src/types/index.ts

import { Timestamp } from "firebase/firestore";

export type UserRole = "user" | "admin";
export type PromptType = "FREE" | "PREMIUM";
export type PaymentStatus = "pending" | "approved" | "rejected";

export type PromptCategory =
  | "Anime"
  | "Fantasy"
  | "Sci-Fi"
  | "Portrait"
  | "Landscape"
  | "Architecture"
  | "Abstract"
  | "Other";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Timestamp;
  premiumUntil?: Timestamp | null;   // ← NEW
  isPremium?: boolean;               // ← NEW (derived, but stored for easy querying)
}

export interface Prompt {
  id: string;
  title: string;
  imageUrl: string;
  promptText: string;
  category: PromptCategory;
  isPremium: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  likesCount: number;
}

export interface Comment {
  id: string;
  promptId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  text: string;
  createdAt: Timestamp;
}

// ─── Payment Request ─────────────────────────────────────────
export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: PaymentStatus;
  requestedAt: Timestamp;
  approvedAt?: Timestamp | null;
  approvedBy?: string | null;
  premiumUntil?: Timestamp | null;
  note?: string;
}

export interface AuthState {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
}

export interface PaginationResult<T> {
  data: T[];
  lastDoc: unknown;
  hasMore: boolean;
}