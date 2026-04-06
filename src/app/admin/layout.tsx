// src/app/admin/layout.tsx
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | 4to Prompt",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-dvh">
        <AdminSidebar />
        {/* Offset for sidebar */}
        <div className="flex-1 flex flex-col min-w-0 md:ml-[220px]">
          <main id="main-content" className="flex-1 p-5 md:p-7">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}