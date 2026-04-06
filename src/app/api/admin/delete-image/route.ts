// src/app/api/admin/delete-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { adminAuth } from "@/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Auth guard helper ────────────────────────────────────────
// Returns the decoded token if the request carries a valid cookie
// from an admin user — otherwise returns a NextResponse error.
async function verifyAdminRequest(
  req: NextRequest,
): Promise<{ uid: string } | NextResponse> {
  const token = req.cookies.get("4to-auth-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Full cryptographic signature verification via Firebase Admin SDK
    const decoded = await adminAuth.verifyIdToken(token);

    // Check Firestore role — never trust client-supplied role claims
    const userSnap = await getFirestore()
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!userSnap.exists || userSnap.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return { uid: decoded.uid };
  } catch (err) {
    console.error("[delete-image] token verification failed:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// ─── DELETE /api/admin/delete-image ──────────────────────────
export async function DELETE(req: NextRequest) {
  // ① Verify caller is an authenticated admin — bail out early if not
  const authResult = await verifyAdminRequest(req);
  if (authResult instanceof NextResponse) return authResult;

  // ② Parse + validate body
  const body = await req.json().catch(() => ({})) as { imageUrl?: string };

  if (!body.imageUrl) {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  // ③ Extract Cloudinary public_id from URL
  // e.g. https://res.cloudinary.com/demo/image/upload/v1234/prompts/abc.jpg
  //      → publicId = "prompts/abc"
  const match = body.imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
  if (!match?.[1]) {
    return NextResponse.json(
      { error: "Could not parse public_id from URL" },
      { status: 400 },
    );
  }

  const publicId = match[1];

  // ④ Delete from Cloudinary
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok" && result.result !== "not found") {
      return NextResponse.json(
        { error: `Cloudinary returned: ${result.result}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, result: result.result });
  } catch (err) {
    console.error("[delete-image] Cloudinary deletion failed:", err);
    return NextResponse.json({ error: "Cloudinary deletion failed" }, { status: 500 });
  }
}