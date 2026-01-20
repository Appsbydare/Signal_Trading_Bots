import type { ReactNode } from "react";
import { getCurrentCustomer } from "@/lib/auth-server";
import Link from "next/link";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const customer = await getCurrentCustomer();
  
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 pb-12">
        {children}
      </div>
    </div>
  );
}


