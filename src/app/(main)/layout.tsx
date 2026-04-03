// src/app/(main)/layout.tsx
import { Navbar } from "@/components/layout/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh">
      <Navbar />
      <main id="main-content" className="flex-1 pt-[56px]">
        {children}
      </main>
    </div>
  );
}