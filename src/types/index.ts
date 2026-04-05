// src/types/index.ts
import { Timestamp } from "firebase/firestore";

/**
 * Covers both live Firestore Timestamps (client SDK) and plain
 * { seconds, nanoseconds } objects that result from JSON
 * serialisation across the server→client boundary (Server Actions,
 * getServerSideProps, etc.).
 */
export type FirebaseTimestamp =
  | Timestamp
  | { seconds: number; nanoseconds: number };

export type UserRole      = "user" | "admin";
export type PromptType    = "FREE" | "PREMIUM";
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
  uid:          string;
  name:         string;
  email:        string;
  photoURL?:    string;
  role:         UserRole;
  createdAt:    FirebaseTimestamp;        // ← was: Timestamp
  premiumUntil?: FirebaseTimestamp | null; // ← was: Timestamp | null
  isPremium?:   boolean;
}

export interface Prompt {
  id:            string;
  title:         string;
  imageUrl:      string;
  promptText:    string;
  category:      PromptCategory;
  isPremium:     boolean;
  createdBy:     string;
  createdByName: string;
  createdAt:     FirebaseTimestamp;       // ← was: Timestamp
  likesCount:    number;
}

export interface Comment {
  id:            string;
  promptId:      string;
  userId:        string;
  userName:      string;
  userPhotoURL?: string;
  text:          string;
  createdAt:     FirebaseTimestamp;       // ← was: Timestamp
}

export interface PaymentRequest {
  id:            string;
  userId:        string;
  userName:      string;
  userEmail:     string;
  status:        PaymentStatus;
  requestedAt:   FirebaseTimestamp;       // ← was: Timestamp
  approvedAt?:   FirebaseTimestamp | null; // ← was: Timestamp | null
  approvedBy?:   string | null;
  premiumUntil?: FirebaseTimestamp | null; // ← was: Timestamp | null
  note?:         string;
}

export interface AuthState {
  user:       AppUser | null;
  loading:    boolean;
  setUser:    (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
}

export interface PaginationResult<T> {
  data:    T[];
  lastDoc: unknown;
  hasMore: boolean;
}