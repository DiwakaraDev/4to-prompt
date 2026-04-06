// src/services/auth.service.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  type AuthError,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import type { AppUser } from "@/types";


const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });


// ─── Login ────────────────────────────────────────────────────
export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}


// ─── Register ─────────────────────────────────────────────────
export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  await setDoc(doc(db, "users", cred.user.uid), {
    uid:       cred.user.uid,
    name,
    email,
    photoURL:  "",
    role:      "user",
    createdAt: serverTimestamp(),
  });

  return cred;
}


// ─── Google OAuth ──────────────────────────────────────────────
export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  const ref  = doc(db, "users", cred.user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid:       cred.user.uid,
      name:      cred.user.displayName ?? "User",
      email:     cred.user.email ?? "",
      photoURL:  cred.user.photoURL ?? "",
      role:      "user",
      createdAt: serverTimestamp(),
    });
  }

  return cred;
}


// ─── Logout ───────────────────────────────────────────────────
export async function logout() {
  await signOut(auth);
}


// ─── Fetch user doc ───────────────────────────────────────────
export async function fetchUserDocument(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
}


// ─── Update profile photo ─────────────────────────────────────
// Saves Cloudinary URL to both Firestore + Firebase Auth profile.
// Called after a successful Cloudinary upload.
export async function updateUserPhotoURL(
  uid: string,
  photoURL: string,
): Promise<void> {
  // 1. Update Firestore users document
  await updateDoc(doc(db, "users", uid), { photoURL });

  // 2. Update Firebase Auth profile so auth.currentUser.photoURL stays in sync
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { photoURL });
  }
}


// ─── Update display name ──────────────────────────────────────
// Saves updated name to both Firestore + Firebase Auth profile.
export async function updateUserName(
  uid: string,
  name: string,
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { name });

  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: name });
  }
}


// ─── Auth cookie (used by middleware) ─────────────────────────
// Sets cookie via server-side API route so it gets HttpOnly + Secure
// flags — not accessible to client-side JS (XSS safe).
export async function setAuthCookie(token: string | null): Promise<void> {
  await fetch("/api/auth/set-cookie", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ token }),
  });
}


// ─── Friendly error messages ──────────────────────────────────
export function getAuthErrorMessage(error: AuthError): string {
  const map: Record<string, string> = {
    "auth/user-not-found":         "No account found with this email.",
    "auth/wrong-password":         "Incorrect password. Please try again.",
    "auth/email-already-in-use":   "This email is already registered.",
    "auth/invalid-email":          "Please enter a valid email address.",
    "auth/weak-password":          "Password must be at least 6 characters.",
    "auth/too-many-requests":      "Too many attempts. Please try again later.",
    "auth/popup-closed-by-user":   "Sign-in popup was closed.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/invalid-credential":     "Invalid credentials. Please try again.",
  };
  return map[error.code] ?? "Something went wrong. Please try again.";
}