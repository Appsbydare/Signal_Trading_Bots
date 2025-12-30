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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Overview of licenses and active sessions for SignalTradingBots
          </p>
        </div>
        <form action="/api/auth/admin/logout" method="post">
          <button
            type="submit"
            className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Log out
          </button>
        </form>
      </div>

      {/* Stats Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Total licenses
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">
            {stats.totalLicenses}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Active licenses
          </div>
          <div className="mt-2 text-3xl font-semibold text-emerald-400">
            {stats.activeLicenses}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Active sessions
          </div>
          <div className="mt-2 text-3xl font-semibold text-[#5e17eb]">
            {stats.activeSessions}
          </div>
        </div>
      </section>

      {/* License & Security */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-white">License & Security</h2>
        <p className="mb-4 text-sm text-zinc-400">
          Monitor and manage trading bot licenses, sessions, and security flags.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href="/admin/licenses"
            className="rounded-md bg-[#5e17eb] px-6 py-2 font-semibold text-white transition hover:bg-[#4512c2]"
          >
            🔐 License Management
          </a>
        </div>
      </section>

      {/* Content & Support Tools */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-white">Content & Support Tools</h2>
        <p className="mb-4 text-sm text-zinc-400">
          Manage what customers see in the Windows app and how the virtual agents respond.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href="/admin/news"
            className="rounded-md border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white transition hover:bg-zinc-700"
          >
            News admin
          </a>
          <a
            href="/admin/youtube-help"
            className="rounded-md border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white transition hover:bg-zinc-700"
          >
            YouTube help admin
          </a>
          <a
            href="/admin/promotional-image"
            className="rounded-md border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white transition hover:bg-zinc-700"
          >
            Promotional image admin
          </a>
          <a
            href="/admin/agents"
            className="rounded-md border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white transition hover:bg-zinc-700"
          >
            Virtual agents
          </a>
          <a
            href="/admin/faqs"
            className="rounded-md border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white transition hover:bg-zinc-700"
          >
            FAQs
          </a>
          <a
            href="/admin/docs"
            className="rounded-md border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white transition hover:bg-zinc-700"
          >
            Knowledge docs
          </a>
          <a
            href="/admin/tickets"
            className="rounded-md border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white transition hover:bg-zinc-700"
          >
            Support tickets
          </a>
        </div>
      </section>
    </div>
  );
}


