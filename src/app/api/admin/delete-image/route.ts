import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req: NextRequest) {
  const { imageUrl } = await req.json() as { imageUrl?: string };

  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  // Extract public_id from Cloudinary URL
  // e.g. https://res.cloudinary.com/demo/image/upload/v1234/prompts/abc.jpg
  //      → publicId = "prompts/abc"
  const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
  if (!match?.[1]) {
    return NextResponse.json({ error: "Could not parse public_id from URL" }, { status: 400 });
  }

  const publicId = match[1];

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
    console.error("[delete-image route]", err);
    return NextResponse.json({ error: "Cloudinary deletion failed" }, { status: 500 });
  }
}