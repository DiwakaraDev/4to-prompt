// src/services/storage.service.ts
// ✅ Cloudinary only — NO firebase/storage imports

// ─────────────────────────────────────────────────────────────
// Upload
// ─────────────────────────────────────────────────────────────

export async function uploadPromptImage(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or " +
      "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local"
    );
  }

  const formData = new FormData();
  formData.append("file",          file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder",        "prompts");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve(res.secure_url as string);
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err?.error?.message ?? "Upload failed."));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Network error. Check your connection."))
    );
    xhr.addEventListener("abort", () =>
      reject(new Error("Upload cancelled."))
    );

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    );
    xhr.send(formData);
  });
}

// ─────────────────────────────────────────────────────────────
// Delete — calls server-side route to sign the Cloudinary request
// ─────────────────────────────────────────────────────────────

export async function deleteStorageFile(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  try {
    const res = await fetch("/api/admin/delete-image", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ imageUrl }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error(
        "[storage.service] Cloudinary deletion failed:",
        body?.error ?? `HTTP ${res.status}`,
      );
    }
  } catch (err) {
    // Non-fatal — Firestore doc is already deleted.
    // Image becomes orphaned in Cloudinary but causes no runtime issues.
    console.error("[storage.service] Failed to reach delete-image API:", err);
  }
}