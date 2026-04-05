// src/app/layout.tsx
import type { Metadata } from "next";
import type { Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const inter = Inter({
  subsets:  ["latin"],
  variable: "--font-inter",
  display:  "swap",
});

const syne = Syne({
  subsets:  ["latin"],
  variable: "--font-syne",
  weight:   ["400", "500", "600", "700", "800"],
  display:  "swap",
});

export const metadata: Metadata = {
  title:       "4to Prompt — AI Image Prompt Gallery",
  description: "Discover, copy and share AI image prompts for Midjourney, DALL·E, and Stable Diffusion.",
  keywords:    ["AI prompts", "Midjourney", "DALL·E", "Stable Diffusion", "image generation"],
  manifest:    "/manifest.json",
  // ✅ themeColor removed — moved to viewport export below
  openGraph: {
    title:       "4to Prompt",
    description: "Discover & copy AI image prompts that actually work.",
    type:        "website",
    locale:      "en_US",
  },
  twitter: {
    card:  "summary_large_image",
    title: "4to Prompt — AI Image Prompt Gallery",
  },
};

// ✅ themeColor must live here in Next.js 15+
export const viewport: Viewport = {
  themeColor: "#bc67ff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${syne.variable}`}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background:   "#1c1f30",
              color:        "#eeeeff",
              border:       "1px solid rgba(188,103,255,0.22)",
              borderRadius: "12px",
              fontSize:     "13px",
              padding:      "10px 16px",
              boxShadow:    "0 8px 32px rgba(0,0,0,0.4)",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#1c1f30" } },
            error:   { iconTheme: { primary: "#f05050", secondary: "#1c1f30" } },
          }}
        />
      </body>
    </html>
  );
}