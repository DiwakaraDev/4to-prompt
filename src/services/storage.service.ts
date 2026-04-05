// src/services/storage.service.ts
// ✅ Cloudinary only — NO firebase/storage imports

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

export async function deleteStorageFile(_imageUrl: string): Promise<void> {
  // TODO: Implement server-side deletion via Cloudinary Admin API.
  // Requires: POST /api/admin/delete-image → cloudinary.uploader.destroy(publicId)
  // using CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET (server-only env vars).
  // Images currently remain in Cloudinary storage after prompt deletion.
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[storage.service] deleteStorageFile() is a no-op.\n" +
      "Image was NOT deleted from Cloudinary:\n" +
      _imageUrl + "\n" +
      "Implement server-side signing via Cloudinary Admin API to enable deletion."
    );
  }
}