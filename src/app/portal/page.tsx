import Link from "next/link";

import { getCurrentCustomer } from "@/lib/auth-server";
import { getLicensesForEmail } from "@/lib/license-db";
import { getPromotionalImage } from "@/lib/promotional-image";

export const metadata = {
  title: "Customer Portal | signaltradingbots",
};

function getLicenseStatusColor(daysRemaining: number): string {
  if (daysRemaining <= 7) return "text-red-600 bg-red-50";
  if (daysRemaining <= 30) return "text-amber-700 bg-amber-50";
  return "text-emerald-700 bg-emerald-50";
}

export default async function PortalPage() {
  const customer = await getCurrentCustomer();

  // Middleware should normally prevent this, but keep a safe-guard.
  if (!customer) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="mb-4 text-2xl font-semibold">You are not logged in</h1>
        <p className="mb-6 text-sm text-zinc-600">
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

  const [licenses, promo] = await Promise.all([
    getLicensesForEmail(customer.email),
    getPromotionalImage(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Welcome back, {customer.email}
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            View your licenses, stay updated with promotions, and reach support via chat.
          </p>
        </div>
        <form action="/api/auth/customer/logout" method="post">
          <button
            type="submit"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            Log out
          </button>
        </form>
      </div>

      {/* My Licenses */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">My Licenses</h2>
            <p className="text-xs text-zinc-500">
              Licenses associated with your email: {customer.email}
            </p>
          </div>
        </div>

        {licenses.length === 0 ? (
          <div className="rounded-md bg-zinc-50 p-4 text-sm text-zinc-600">
            No licenses found for this email yet. If you have recently purchased, please allow a
            few minutes for processing or contact support.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Product / Plan
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    License Key
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Expires
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Days Left
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {licenses.map((lic) => {
                  const expiresAt = new Date(lic.expires_at);
                  const now = new Date();
                  const daysRemaining = Math.max(
                    0,
                    Math.ceil(
                      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                    ),
                  );

                  return (
                    <tr key={lic.id}>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-800">
                        <div className="font-medium capitalize">{lic.plan}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-800">
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-zinc-100 px-2 py-1 text-[0.7rem]">
                            {lic.license_key}
                          </code>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-800">
                        <span className="inline-flex rounded-full bg-zinc-100 px-2 py-1 text-[0.7rem] capitalize">
                          {lic.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-800">
                        {expiresAt.toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-[0.7rem] ${getLicenseStatusColor(
                            daysRemaining,
                          )}`}
                        >
                          {daysRemaining} days
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right text-xs">
                        <div className="flex justify-end gap-2">
                          <Link
                            href="/products"
                            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-[0.7rem] font-medium text-zinc-800 hover:bg-zinc-50"
                          >
                            View details
                          </Link>
                          <Link
                            href="/payment"
                            className="rounded-md bg-[#5e17eb] px-2 py-1 text-[0.7rem] font-medium text-white hover:bg-[#4512c2]"
                          >
                            Renew / Upgrade
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Promotions banner */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Promotions</h2>
            <p className="text-xs text-zinc-500">
              Latest offer configured from the admin promotional image panel.
            </p>
          </div>
        </div>
        {promo ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <p className="mb-2 text-sm text-zinc-700">
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
                className="block overflow-hidden rounded-lg border border-zinc-200"
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
          <div className="rounded-md bg-zinc-50 p-4 text-sm text-zinc-600">
            No active promotions right now. Check back later for special offers.
          </div>
        )}
      </section>

      {/* Support chat note */}
      <section className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-xs text-zinc-600">
        If you need help, use the support chat widget in the bottom-right corner of the page
        (powered by Tawk.to), or{" "}
        <Link href="/contact" className="font-medium text-[#5e17eb] hover:underline">
          contact us here
        </Link>
        .
      </section>
    </div>
  );
}


