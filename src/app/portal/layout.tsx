import type { ReactNode } from "react";
import { getCurrentCustomer } from "@/lib/auth-server";
import Link from "next/link";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const customer = await getCurrentCustomer();
  
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Portal Navbar */}
      {customer && (
        <div className="bg-white border-b border-zinc-200 mb-6">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Customer Portal</h2>
              <p className="text-xs text-zinc-600">{customer.email}</p>
            </div>
            <form action="/api/auth/customer/logout" method="post">
              <button
                type="submit"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 pb-12">
        {children}
      </div>
    </div>
  );
}


