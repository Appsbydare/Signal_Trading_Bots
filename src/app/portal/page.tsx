import Link from "next/link";

import { getCurrentCustomer } from "@/lib/auth-server";
import { getLicensesForEmail } from "@/lib/license-db";
import { getPromotionalImage } from "@/lib/promotional-image";
import { listTicketsForCustomer } from "@/lib/tickets-db";
import { LicenseTable } from "@/components/LicenseTable";
import { RequestDownloadSection } from "@/components/RequestDownloadSection";

export const metadata = {
  title: "Customer Portal | signaltradingbots",
};

// Force dynamic rendering to always show fresh license data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PortalPage() {
  const customer = await getCurrentCustomer();

  // Middleware should normally prevent this, but keep a safe-guard.
  if (!customer) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="mb-4 text-2xl font-semibold">You are not logged in</h1>
        <p className="mb-6 text-sm text-zinc-400">
          Please log in to access your customer portal.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#4512c2]"
        >
          Go to login
        </Link>
      </div>
    );
  }

  const [licenses, promo, tickets] = await Promise.all([
    getLicensesForEmail(customer.email),
    getPromotionalImage(),
    listTicketsForCustomer(customer.id),
  ]);

  // Show security warning only if user hasn't set their password yet
  const showSecurityWarning = !customer.password_set_by_user;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Customer Portal
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {customer.email}
          </p>
        </div>
        <form action="/api/auth/customer/logout" method="post">
          <button
            type="submit"
            className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Log out
          </button>
        </form>
      </div>

      {/* Security Warning */}
      {showSecurityWarning && (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                <svg className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-amber-300">Secure Your Account</h3>
              <p className="mt-1 text-sm text-amber-200/80">
                Your account was created automatically when you purchased. We recommend setting a password so you can log in directly without requesting a magic link each time.
              </p>
              <Link
                href="/portal/settings"
                className="mt-4 inline-flex items-center rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-amber-400"
              >
                Set Up Password
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* My Licenses */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-white">My Licenses</h2>
            <p className="text-sm text-zinc-400">
              Licenses associated with your email: {customer.email}
            </p>
          </div>
          <Link
            href="/products#plans"
            className="rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#4512c2] transition"
          >
            Renew / Upgrade
          </Link>
        </div>

        {licenses.length === 0 ? (
          <div className="rounded-md bg-zinc-800/50 p-4 text-sm text-zinc-400">
            No licenses found for this email yet. If you have recently purchased, please allow a
            few minutes for processing or contact support.
          </div>
        ) : (
          <LicenseTable licenses={licenses} />
        )}
      </section>

      {/* Download Software */}
      <RequestDownloadSection />

      {/* Promotions banner */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-white">Promotions</h2>
            <p className="text-sm text-zinc-400">
              Latest offer configured from the admin promotional image panel.
            </p>
          </div>
        </div>
        {promo ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <p className="mb-2 text-sm text-zinc-300">
                Click the banner to learn more about the current promotion or bonus.
              </p>
              {promo.redirectUrl && (
                <p className="text-xs text-zinc-500">
                  Redirect URL:{" "}
                  <a
                    href={promo.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5e17eb] hover:underline"
                  >
                    {promo.redirectUrl}
                  </a>
                </p>
              )}
            </div>
            <div className="flex-1">
              <a
                href={promo.redirectUrl || "#"}
                target={promo.redirectUrl ? "_blank" : undefined}
                rel={promo.redirectUrl ? "noopener noreferrer" : undefined}
                className="block overflow-hidden rounded-lg border border-zinc-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={promo.imageUrl}
                  alt="Promotional banner"
                  className="h-40 w-full object-cover"
                />
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-md bg-zinc-800/50 p-4 text-sm text-zinc-400">
            No active promotions right now. Check back later for special offers.
          </div>
        )}
      </section>

      {/* Support tickets */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-white">Support Tickets</h2>
            <p className="text-sm text-zinc-400">
              Tickets created from the virtual support chat or by our team on your behalf.
            </p>
          </div>
          <Link
            href="/portal/tickets"
            className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition"
          >
            View All
          </Link>
        </div>
        {tickets.length === 0 ? (
          <div className="rounded-md bg-zinc-800/50 p-4 text-xs text-zinc-400">
            No tickets found yet. If a question is beyond the virtual agents, you can escalate from
            the chat widget and track it here.
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-zinc-500">Ticket #</th>
                  <th className="px-3 py-2 text-left font-semibold text-zinc-500">Subject</th>
                  <th className="px-3 py-2 text-left font-semibold text-zinc-500">Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-zinc-500">Created</th>
                  <th className="px-3 py-2 text-left font-semibold text-zinc-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {tickets.slice(0, 5).map((t, index) => (
                  <tr key={t.id} className="hover:bg-zinc-800/30">
                    <td className="px-3 py-2 text-zinc-300">#{tickets.length - index}</td>
                    <td className="px-3 py-2 text-zinc-300">{t.subject}</td>
                    <td className="px-3 py-2 capitalize">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${t.status === "pending"
                        ? "bg-amber-500/20 text-amber-300"
                        : t.status === "sorted"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-zinc-700 text-zinc-300"
                        }`}>
                        {t.status === "pending" ? "Pending" : t.status === "sorted" ? "Resolved" : t.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-zinc-300">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/portal/tickets/${t.id}`}
                        className="text-[#5e17eb] hover:text-[#4512c2] transition"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tickets.length > 5 && (
              <div className="mt-3 text-center">
                <Link
                  href="/portal/tickets"
                  className="text-xs text-zinc-400 hover:text-white transition"
                >
                  View all {tickets.length} tickets →
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}


