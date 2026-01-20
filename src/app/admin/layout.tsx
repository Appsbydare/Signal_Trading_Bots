import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 pb-12 pt-6">
        {children}
      </div>
    </div>
  );
}

