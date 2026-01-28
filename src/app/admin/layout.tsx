"use client";

import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ReactNode, useEffect } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname?.startsWith("/admin/login");

  // Prevent double scrollbars by locking body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (isLoginPage) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950">
        <div className="w-full max-w-md px-6">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-zinc-950">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-zinc-950 px-8 py-8 h-full">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
