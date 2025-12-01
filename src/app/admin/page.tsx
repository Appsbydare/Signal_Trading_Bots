import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth-server";
import { getSupabaseClient } from "@/lib/supabase-storage";

async function getDashboardStats() {
  const client = getSupabaseClient();

  const [{ count: totalLicenses }, { count: activeLicenses }, { count: activeSessions }] =
    await Promise.all([
      client.from("licenses").select("*", { count: "exact", head: true }),
      client
        .from("licenses")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
      client
        .from("license_sessions")
        .select("*", { count: "exact", head: true })
        .eq("active", true),
    ]);

  return {
    totalLicenses: totalLicenses ?? 0,
    activeLicenses: activeLicenses ?? 0,
    activeSessions: activeSessions ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Admin dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Overview of licenses and active sessions for SignalTradingBots.
          </p>
        </div>
        <form action="/api/auth/admin/logout" method="post">
          <button
            type="submit"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            Log out
          </button>
        </form>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Total licenses
          </div>
          <div className="mt-2 text-3xl font-semibold text-zinc-900">
            {stats.totalLicenses}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Active licenses
          </div>
          <div className="mt-2 text-3xl font-semibold text-emerald-700">
            {stats.activeLicenses}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Active sessions
          </div>
          <div className="mt-2 text-3xl font-semibold text-[#5e17eb]">
            {stats.activeSessions}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-zinc-900">Content & support tools</h2>
        <p className="mb-4 text-xs text-zinc-600">
          Manage what customers see in the Windows app and how the virtual agents respond.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href="/admin/news"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-800 hover:bg-zinc-50"
          >
            News admin
          </a>
          <a
            href="/admin/youtube-help"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-800 hover:bg-zinc-50"
          >
            YouTube help admin
          </a>
          <a
            href="/admin/promotional-image"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-800 hover:bg-zinc-50"
          >
            Promotional image admin
          </a>
          <a
            href="/admin/agents"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-800 hover:bg-zinc-50"
          >
            Virtual agents
          </a>
          <a
            href="/admin/faqs"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-800 hover:bg-zinc-50"
          >
            FAQs
          </a>
          <a
            href="/admin/docs"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-800 hover:bg-zinc-50"
          >
            Knowledge docs
          </a>
          <a
            href="/admin/tickets"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-800 hover:bg-zinc-50"
          >
            Support tickets
          </a>
        </div>
      </section>
    </div>
  );
}


