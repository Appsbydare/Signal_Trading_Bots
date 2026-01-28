import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getSupabaseClient } from "@/lib/supabase-storage";
import { StatCard } from "@/components/admin/StatCard";
import { DashboardToolsGrid } from "@/components/admin/DashboardToolsGrid";

// Icons
function LicenseIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}

function UserGroupIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  )
}

function SignalIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  )
}

async function getDashboardStats() {
  // Prune zombies first to match License page logic
  const { expireZombieSessions } = await import("@/lib/license-db");
  await expireZombieSessions();

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
      {/* Stats Cards */}
      <section className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Generated Licenses"
          value={stats.totalLicenses}
          icon={<LicenseIcon className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Active Licenses"
          value={stats.activeLicenses}
          icon={<SignalIcon className="h-6 w-6" />}
          color="emerald"
          trend="Active Now"
          trendUp={true}
        />
        <StatCard
          title="Online Sessions"
          value={stats.activeSessions}
          icon={<UserGroupIcon className="h-6 w-6" />}
          color="purple"
        />
      </section>

      {/* Tools Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Management Tools</h3>
        <DashboardToolsGrid />
      </div>
    </div>
  );
}


