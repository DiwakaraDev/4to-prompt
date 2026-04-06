// src/app/api/auth/set-cookie/route.ts
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "4to-auth-token";
const ONE_WEEK   = 60 * 60 * 24 * 7;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { token } = body as { token?: string | null };

  const res = NextResponse.json({ ok: true });

  if (token) {
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,                                         // ← not readable by JS (XSS safe)
      secure:   process.env.NODE_ENV === "production",       // ← HTTPS only in prod
      sameSite: "lax",                                       // ← CSRF protection
      maxAge:   ONE_WEEK,
      path:     "/",
    });
  } else {
    res.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   0,                                           // ← deletes the cookie
      path:     "/",
    });
  }

  return res;
}