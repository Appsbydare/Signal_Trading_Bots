import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getSupabaseClient } from "@/lib/supabase-storage";
import { AdminLicenseRow } from "@/components/AdminLicenseRow";
import { SecurityLogsTable } from "@/components/SecurityLogsTable";

async function getLicensesWithData() {
  const client = getSupabaseClient();

  // 1. Get all licenses
  const { data: licenses, error: licenseError } = await client
    .from("licenses")
    .select("*")
    .order("created_at", { ascending: false });

  if (licenseError) throw licenseError;

  // 2. Get all sessions (active and inactive for history)
  const { data: sessions, error: sessionError } = await client
    .from("license_sessions")
    .select("*")
    .order("last_seen_at", { ascending: false });

  if (sessionError) throw sessionError;

  // 3. Get all banned devices
  const { data: banned, error: bannedError } = await client
    .from("banned_devices")
    .select("device_id");

  if (bannedError) throw bannedError;
  const bannedSet = new Set(banned?.map(b => b.device_id) || []);

  // 4. Merge data
  return (licenses || []).map((license) => {
    const licenseSessions = sessions?.filter(s => s.license_key === license.license_key) || [];
    const licenseBannedDevices = Array.from(new Set(
      licenseSessions.filter(s => bannedSet.has(s.device_id)).map(s => s.device_id)
    ));

    return {
      ...license,
      active_sessions_count: licenseSessions.filter(s => s.active).length,
      sessions: licenseSessions,
      banned_devices: licenseBannedDevices
    };
  });
}

async function getRecentValidationLogs(limit: number = 50) {
  const client = getSupabaseClient();

  try {
    const { data, error } = await client
      .from("license_validation_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      // Table doesn't exist yet - return empty array
      console.log("Validation log table not found (this is optional)");
      return [];
    }

    return data || [];
  } catch (err) {
    // Gracefully handle missing table
    return [];
  }
}

export default async function AdminLicensesPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const licenses = await getLicensesWithData();
  const recentLogs = await getRecentValidationLogs(50);

  // Create a quick lookup map for licenses
  const licenseMap = new Map(licenses.map(l => [l.license_key, l]));

  // Enrichment of logs
  const enrichedLogs = recentLogs.map((log: any) => {
    const licensedData = licenseMap.get(log.license_key);
    return {
      ...log,
      user_email: licensedData?.email,
      license_plan: licensedData?.plan,
      license_status: licensedData?.status
    };
  });

  return (
    <div className="space-y-6 w-full max-w-full mx-auto px-4">
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">License Management</h1>
          <p className="mt-1 text-sm text-zinc-400">
            View and manage all trading bot licenses and active sessions
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/admin"
            className="rounded-md border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            ← Back to Dashboard
          </a>
          <form action="/api/auth/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              Log out
            </button>
          </form>
        </div>
      </div>

      {/* Statistics Cards */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Total Licenses
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">
            {licenses.length}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Active Licenses
          </div>
          <div className="mt-2 text-3xl font-semibold text-emerald-400">
            {licenses.filter((l) => l.status === "active").length}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Active Sessions
          </div>
          <div className="mt-2 text-3xl font-semibold text-[#5e17eb]">
            {licenses.reduce((sum, l) => sum + (l.active_sessions || 0), 0)}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Duplicate Flags
          </div>
          <div className="mt-2 text-3xl font-semibold text-red-400">
            {licenses.filter((l) => l.duplicate_detected).length}
          </div>
        </div>
      </section>

      {/* Licenses Table */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm">
        <div className="border-b border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white">All Licenses</h2>
          <p className="mt-1 text-sm text-zinc-400">Complete list of all licenses in the system</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-zinc-800 bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 w-48">
                  License Key
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Expires
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Sessions
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Flags
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 min-w-[100px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-zinc-500">
                    No licenses found
                  </td>
                </tr>
              ) : (
                licenses.map((license) => (
                  <AdminLicenseRow key={license.id} license={license as any} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Activity Log - Only show if validation log table exists */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm">
        <div className="border-b border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white">Security & Validation Audit Log</h2>
          <p className="mt-1 text-sm text-zinc-400">Detailed track of all validation attempts, conflicts, and bans</p>
        </div>

        <div className="p-0">
          <div className="min-w-full inline-block align-middle">
            <SecurityLogsTable logs={enrichedLogs} />
          </div>
        </div>
      </section>

      {/* Admin Actions Info */}
      <section className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
        <h3 className="mb-2 text-sm font-semibold text-blue-300">Admin Actions Available</h3>
        <ul className="space-y-1 text-sm text-blue-200/80">
          <li>• View all licenses and their active sessions</li>
          <li>• Monitor duplicate detection flags</li>
          <li>• Review validation activity logs</li>
          <li>• <strong>Revoke licenses</strong> - Instantly revoke any license and deactivate all sessions</li>
          <li>• Force deactivate sessions via API (coming soon)</li>
        </ul>
      </section>
    </div>
  );
}

