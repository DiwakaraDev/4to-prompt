// src/components/profile/ProfileImageUpload.tsx
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { CldUploadWidget, type CloudinaryUploadWidgetOptions } from "next-cloudinary";
import { RiCameraLine, RiLoader4Line, RiUserLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { updateUserPhotoURL } from "@/services/auth.service";
import toast from "react-hot-toast";

interface CloudinaryResult {
  secure_url: string;
  public_id:  string;
  width:      number;
  height:     number;
}

interface ProfileImageUploadProps {
  size?:      "sm" | "md" | "lg";
  showLabel?: boolean;
}

const SIZE_MAP = {
  sm: { outer: 64,  icon: 14, camera: 18 },
  md: { outer: 96,  icon: 20, camera: 20 },
  lg: { outer: 128, icon: 28, camera: 22 },
};

// Extend the incomplete upstream type to include `transformation`
// which is a valid Cloudinary Upload Widget option omitted from @types
type WidgetOptions = CloudinaryUploadWidgetOptions & {
  transformation?: Array<Record<string, unknown>>;
};

const UPLOAD_OPTIONS: WidgetOptions = {
  maxFiles:              1,
  resourceType:          "image",
  cropping:              true,
  croppingAspectRatio:   1,
  croppingShowDimensions: true,
  folder:                "4to-prompt/avatars",
  sources:               ["local", "camera"],
  transformation: [
    { width: 400, height: 400, crop: "fill", gravity: "face" },
    { quality: "auto", fetch_format: "auto" },
  ],
  styles: {
    palette: {
      window:          "#1a1d26",
      windowBorder:    "#bc67ff",
      tabIcon:         "#bc67ff",
      menuIcons:       "#a0a0a0",
      textDark:        "#f0f0f0",
      textLight:       "#ffffff",
      link:            "#bc67ff",
      action:          "#bc67ff",
      inactiveTabIcon: "#555a67",
      error:           "#ff00d4",
      inProgress:      "#00f2ff",
      complete:        "#33ff00",
      sourceBg:        "#12141f",
    },
  },
};

export function ProfileImageUpload({
  size      = "md",
  showLabel = true,
}: ProfileImageUploadProps) {
  const { user }  = useAuth();
  const setUser   = useAuthStore((s) => s.setUser);
  const [uploading, setUploading] = useState(false);
  const dim = SIZE_MAP[size];

  const handleUploadSuccess = useCallback(
    async (result: CloudinaryResult) => {
      if (!user) return;
      setUploading(true);
      try {
        await updateUserPhotoURL(user.uid, result.secure_url);
        setUser({ ...user, photoURL: result.secure_url });
        toast.success("Profile photo updated!");
      } catch {
        toast.error("Failed to save photo. Try again.");
      } finally {
        setUploading(false);
      }
    },
    [user, setUser],
  );

  if (!user) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={UPLOAD_OPTIONS}
        onSuccess={(result) => {
          if (
            result.event === "success" &&
            typeof result.info === "object" &&
            result.info !== null &&
            "secure_url" in result.info
          ) {
            handleUploadSuccess(result.info as CloudinaryResult);
          }
        }}
        onError={() => {
          toast.error("Upload failed. Please try again.");
          setUploading(false);
        }}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            disabled={uploading}
            aria-label="Change profile photo"
            className="group relative shrink-0 focus-visible:outline-none"
            style={{ width: dim.outer, height: dim.outer }}
          >
            {/* Avatar circle */}
            <div
              className="relative w-full h-full overflow-hidden rounded-full transition-all duration-300"
              style={{
                border:     "2px solid rgba(188,103,255,0.25)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.name ?? "Profile"}
                  fill
                  sizes={`${dim.outer}px`}
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <RiUserLine
                    size={dim.icon}
                    style={{ color: "var(--color-text-faint)" }}
                  />
                </div>
              )}

              {/* Hover overlay */}
              <div
                className={cn(
                  "absolute inset-0 flex flex-col items-center justify-center gap-1",
                  "rounded-full opacity-0 transition-opacity duration-200",
                  "group-hover:opacity-100",
                  uploading && "opacity-100",
                )}
                style={{ background: "rgba(0,0,0,0.58)" }}
              >
                {uploading ? (
                  <RiLoader4Line
                    size={dim.camera}
                    className="animate-spin text-white"
                  />
                ) : (
                  <>
                    <RiCameraLine size={dim.camera} className="text-white" />
                    {size !== "sm" && (
                      <span className="text-[10px] font-medium text-white/80">
                        Change
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Online dot */}
            <span
              className="absolute bottom-0.5 right-0.5 block rounded-full bg-emerald-400"
              style={{
                width:  size === "lg" ? 14 : 10,
                height: size === "lg" ? 14 : 10,
                border: "2px solid var(--color-bg)",
              }}
            />
          </button>
        )}
      </CldUploadWidget>

      {showLabel && (
        <p
          className="text-xs text-center"
          style={{ color: "var(--color-text-faint)" }}
        >
          Click to change photo
        </p>
      )}
    </div>
  );
}