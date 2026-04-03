// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/profile", "/admin"];

// Routes only for guests (redirect if already logged in)
const GUEST_ONLY_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Firebase auth session cookie
  // Firebase client SDK stores the token — we use a custom cookie
  // set during login (see Step 5.6 below)
  const authCookie = request.cookies.get("4to-auth-token")?.value;
  const isLoggedIn = !!authCookie;

  // ── Protect admin + profile routes ──────────────────────────
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  if (isProtected && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // ── Redirect logged-in users away from auth pages ───────────
  const isGuestOnly = GUEST_ONLY_ROUTES.some(r => pathname.startsWith(r));
  if (isGuestOnly && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};