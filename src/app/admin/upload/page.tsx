// src/app/admin/upload/page.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { uploadPromptImage } from "@/services/storage.service";
import { addPrompt } from "@/services/prompts.service";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { PromptCategory } from "@/types";
import {
  RiUploadCloud2Line, RiCloseLine, RiVipCrownLine,
  RiCheckLine, RiImageLine,
} from "react-icons/ri";

const CATEGORIES: PromptCategory[] = [
  "Anime", "Fantasy", "Sci-Fi", "Portrait",
  "Landscape", "Architecture", "Abstract", "Other",
];

interface FormState {
  title:      string;
  promptText: string;
  category:   PromptCategory;
  isPremium:  boolean;
}

export default function UploadPromptPage() {
  const router   = useRouter();
  const { user } = useAuth();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    title:      "",
    promptText: "",
    category:   "Abstract",
    isPremium:  false,
  });
  const [errors,     setErrors]     = useState<Partial<Record<keyof FormState, string>>>({});
  const [imageFile,  setImageFile]  = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading,  setUploading]  = useState(false);
  const [uploadPct,  setUploadPct]  = useState(0);
  const [dragOver,   setDragOver]   = useState(false);

  // ── Image drop / pick ────────────────────────────────────────
  function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  }, []);

  // ── Validation ───────────────────────────────────────────────
  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim())      e.title      = "Title is required.";
    if (!form.promptText.trim()) e.promptText = "Prompt text is required.";
    if (!imageFile)              (e as Record<string, string>).image = "Please upload an image.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !imageFile || !user) return;

    setUploading(true);
    try {
      // 1. Upload image to Firebase Storage
      const imageUrl = await uploadPromptImage(imageFile, pct => setUploadPct(pct));

      // 2. Save prompt document to Firestore
      await addPrompt({
        title:         form.title.trim(),
        promptText:    form.promptText.trim(),
        category:      form.category,
        isPremium:     form.isPremium,
        imageUrl,
        createdBy:     user.uid,
        createdByName: user.name,
      });

      toast.success("Prompt published successfully!");
      router.push("/admin/prompts");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadPct(0);
    }
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="max-w-2xl">

      {/* Header */}
      <div className="mb-6">
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xl)", fontWeight: 800,
        }}>
          Add New Prompt
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          Upload an AI-generated image and its prompt
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        {/* ── Image Upload ───────────────────────────────────── */}
        <div>
          <label className="label">Image <span style={{ color: "var(--color-error)" }}>*</span></label>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden"
              style={{
                aspectRatio: "16/9",
                border: "1px solid rgba(255,255,255,0.09)",
              }}>
              <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Remove image"
                className="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center
                           transition-colors"
                style={{
                  background: "rgba(10,12,22,0.85)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "var(--color-text-muted)",
                }}>
                <RiCloseLine size={16} />
              </button>
              <div className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded-lg"
                style={{ background: "rgba(10,12,22,0.8)", color: "var(--color-text-muted)" }}>
                {imageFile?.name}
              </div>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload image"
              onClick={() => fileRef.current?.click()}
              onKeyDown={e => e.key === "Enter" && fileRef.current?.click()}
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-xl cursor-pointer",
                "transition-all duration-200",
              )}
              style={{
                minHeight: "180px",
                border: `2px dashed ${dragOver
                  ? "rgba(188,103,255,0.55)"
                  : "rgba(255,255,255,0.12)"}`,
                background: dragOver
                  ? "rgba(188,103,255,0.06)"
                  : "var(--color-surface-2)",
              }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "var(--color-primary-muted)" }}>
                <RiUploadCloud2Line size={22} style={{ color: "var(--color-primary)" }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Drop image here or{" "}
                  <span style={{ color: "var(--color-primary)" }}>browse</span>
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-faint)" }}>
                  PNG, JPG, WEBP · Max 10 MB
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFileInput}
            className="sr-only"
            aria-hidden="true"
          />
          {(errors as Record<string, string>).image && (
            <p className="form-error animate-fadeIn">
              {(errors as Record<string, string>).image}
            </p>
          )}
        </div>

        {/* ── Title ─────────────────────────────────────────── */}
        <div>
          <label htmlFor="up-title" className="label">
            Title <span style={{ color: "var(--color-error)" }}>*</span>
          </label>
          <input
            id="up-title"
            type="text"
            value={form.title}
            onChange={e => {
              setForm(p => ({ ...p, title: e.target.value }));
              if (errors.title) setErrors(p => ({ ...p, title: undefined }));
            }}
            placeholder="e.g. Cyberpunk City at Night"
            className={cn("input", errors.title && "input-error")}
            maxLength={80}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.title
              ? <p className="form-error animate-fadeIn">{errors.title}</p>
              : <span />}
            <span className="text-xs" style={{ color: "var(--color-text-faint)" }}>
              {form.title.length}/80
            </span>
          </div>
        </div>

        {/* ── Prompt Text ───────────────────────────────────── */}
        <div>
          <label htmlFor="up-prompt" className="label">
            Prompt Text <span style={{ color: "var(--color-error)" }}>*</span>
          </label>
          <textarea
            id="up-prompt"
            value={form.promptText}
            onChange={e => {
              setForm(p => ({ ...p, promptText: e.target.value }));
              if (errors.promptText) setErrors(p => ({ ...p, promptText: undefined }));
            }}
            placeholder="The exact prompt used to generate this image…"
            rows={5}
            className={cn("input resize-none", errors.promptText && "input-error")}
            style={{ minHeight: "120px" }}
            maxLength={2000}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.promptText
              ? <p className="form-error animate-fadeIn">{errors.promptText}</p>
              : <span />}
            <span className="text-xs" style={{ color: "var(--color-text-faint)" }}>
              {form.promptText.length}/2000
            </span>
          </div>
        </div>

        {/* ── Category ──────────────────────────────────────── */}
        <div>
          <label htmlFor="up-category" className="label">Category</label>
          <select
            id="up-category"
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value as PromptCategory }))}
            className="input"
            style={{ cursor: "pointer" }}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}
                style={{ background: "var(--color-surface-3)", color: "var(--color-text)" }}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* ── Premium toggle ────────────────────────────────── */}
        <div>
          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, isPremium: !p.isPremium }))}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl",
              "border transition-all duration-200",
            )}
            style={{
              background:   form.isPremium
                ? "rgba(245,200,66,0.08)" : "var(--color-surface-2)",
              borderColor:  form.isPremium
                ? "rgba(245,200,66,0.30)" : "rgba(255,255,255,0.08)",
            }}
            aria-pressed={form.isPremium}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: form.isPremium ? "rgba(245,200,66,0.15)" : "rgba(255,255,255,0.05)",
                  color:      form.isPremium ? "var(--color-gold)" : "var(--color-text-faint)",
                }}>
                <RiVipCrownLine size={16} />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold"
                  style={{ color: form.isPremium ? "var(--color-gold)" : "var(--color-text)" }}>
                  Premium Prompt
                </div>
                <div className="text-xs" style={{ color: "var(--color-text-faint)" }}>
                  {form.isPremium ? "Only premium users can view" : "Visible to everyone for free"}
                </div>
              </div>
            </div>

            {/* Toggle pill */}
            <div className="relative w-11 h-6 rounded-full transition-all duration-300 shrink-0"
              style={{ background: form.isPremium ? "var(--color-gold)" : "rgba(255,255,255,0.10)" }}>
              <div className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300",
                form.isPremium ? "left-5" : "left-0.5"
              )} />
            </div>
          </button>
        </div>

        {/* ── Upload progress ───────────────────────────────── */}
        {uploading && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between text-xs mb-1.5"
              style={{ color: "var(--color-text-muted)" }}>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border border-white/20 border-t-[var(--color-primary)]
                                  rounded-full animate-spin" />
                {uploadPct < 100 ? `Uploading image… ${uploadPct}%` : "Saving prompt…"}
              </span>
              <span>{uploadPct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${uploadPct}%`,
                  background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
                }}
              />
            </div>
          </div>
        )}

        {/* ── Submit ────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={uploading}
            className="btn btn-primary flex-1 group"
            style={{ minHeight: "44px" }}>
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white
                                  rounded-full animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <RiImageLine size={16} />
                Publish Prompt
                <RiCheckLine size={15}
                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </button>
          <button type="button" onClick={() => router.push("/admin/prompts")}
            className="btn btn-ghost" disabled={uploading}>
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}