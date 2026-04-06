// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/profile", "/admin"];

// Routes only for guests (redirect if already logged in)
const GUEST_ONLY_ROUTES = ["/login", "/register"];

/**
 * Lightweight JWT expiry check — runs in Edge runtime.
 *
 * We cannot use Firebase Admin SDK here (Node.js only), so we do a
 * "client-side" decode of the JWT payload to check the `exp` claim.
 * This does NOT cryptographically verify the signature — full
 * verification happens in the Admin SDK inside API route handlers.
 * The goal here is: reject obviously expired/malformed tokens early,
 * before they even hit a protected page.
 */
function isTokenExpired(token: string): boolean {
  try {
    // JWT structure: header.payload.signature (all base64url encoded)
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    // base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));

    if (typeof payload.exp !== "number") return true;

    // exp is in seconds — compare against current time in ms
    return payload.exp * 1000 < Date.now();
  } catch {
    // Any parse failure → treat as expired
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authCookie = request.cookies.get("4to-auth-token")?.value;

  // Cookie must exist AND token must not be expired
  const isLoggedIn = !!authCookie && !isTokenExpired(authCookie);

  // ── If cookie exists but token is expired, clear it on redirect ──
  // This prevents an infinite loop where the user has a stale cookie
  // and keeps getting redirected with it still present.
  const makeRedirect = (url: URL) => {
    const res = NextResponse.redirect(url);
    if (authCookie && isTokenExpired(authCookie)) {
      res.cookies.set("4to-auth-token", "", {
        maxAge: 0,
        path: "/",
      });
    }
    return res;
  };

  // ── Protect admin + profile routes ───────────────────────────
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return makeRedirect(url);
  }

  // ── Redirect logged-in users away from auth pages ────────────
  const isGuestOnly = GUEST_ONLY_ROUTES.some((r) => pathname.startsWith(r));
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