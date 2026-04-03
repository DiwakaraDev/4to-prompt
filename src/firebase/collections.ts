// src/firebase/collections.ts
import {
  collection,
  CollectionReference,
  DocumentData,
} from "firebase/firestore";
import { db } from "./config";

// Type-safe collection references
function typedCollection<T = DocumentData>(
  path: string
): CollectionReference<T> {
  return collection(db, path) as CollectionReference<T>;
}

import type { AppUser, Prompt, Comment } from "@/types";

export const Collections = {
  USERS:    "users",
  PROMPTS:  "prompts",
  COMMENTS: "comments",
} as const;

// Typed collection refs
export const usersCol    = typedCollection<AppUser>("users");
export const promptsCol  = typedCollection<Prompt>("prompts");
export const commentsCol = typedCollection<Comment>("comments");