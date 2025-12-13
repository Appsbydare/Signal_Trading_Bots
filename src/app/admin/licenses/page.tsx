import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getSupabaseClient } from "@/lib/supabase-storage";

interface LicenseWithSessions {
  id: number;
  license_key: string;
  email: string;
  plan: string;
  status: string;
  created_at: string;
  expires_at: string;
  duplicate_detected: boolean;
  grace_period_allowed: boolean;
  active_sessions: number;
}

async function getLicensesWithSessionCount(): Promise<LicenseWithSessions[]> {
  const client = getSupabaseClient();

  // Get all licenses
  const { data: licenses, error: licenseError } = await client
    .from("licenses")
    .select("*")
    .order("created_at", { ascending: false });

  if (licenseError) {
    throw licenseError;
  }

  // For each license, count active sessions
  const licensesWithSessions = await Promise.all(
    (licenses || []).map(async (license) => {
      const { count } = await client
        .from("license_sessions")
        .select("*", { count: "exact", head: true })
        .eq("license_key", license.license_key)
        .eq("active", true);

      return {
        ...license,
        active_sessions: count ?? 0,
      };
    })
  );

  return licensesWithSessions;
}

async function getRecentValidationLogs(limit: number = 50) {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("license_validation_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching validation logs:", error);
    return [];
  }

  return data || [];
}

export default async function AdminLicensesPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const licenses = await getLicensesWithSessionCount();
  const recentLogs = await getRecentValidationLogs(50);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">License Management</h1>
          <p className="mt-1 text-sm text-zinc-600">
            View and manage all trading bot licenses and active sessions
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/admin"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            ← Back to Dashboard
          </a>
          <form action="/api/auth/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
            >
              Log out
            </button>
          </form>
        </div>
      </div>

      {/* Statistics Cards */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Total Licenses
          </div>
          <div className="mt-2 text-3xl font-semibold text-zinc-900">
            {licenses.length}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Active Licenses
          </div>
          <div className="mt-2 text-3xl font-semibold text-emerald-700">
            {licenses.filter((l) => l.status === "active").length}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Active Sessions
          </div>
          <div className="mt-2 text-3xl font-semibold text-[#5e17eb]">
            {licenses.reduce((sum, l) => sum + l.active_sessions, 0)}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Duplicate Flags
          </div>
          <div className="mt-2 text-3xl font-semibold text-red-600">
            {licenses.filter((l) => l.duplicate_detected).length}
          </div>
        </div>
      </section>

      {/* Licenses Table */}
      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-6">
          <h2 className="text-lg font-semibold text-zinc-900">All Licenses</h2>
          <p className="mt-1 text-sm text-zinc-600">Complete list of all licenses in the system</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  License Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Flags
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-500">
                    No licenses found
                  </td>
                </tr>
              ) : (
                licenses.map((license) => {
                  const expiresAt = new Date(license.expires_at);
                  const isExpired = expiresAt < new Date();
                  const daysUntilExpiry = Math.ceil(
                    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr key={license.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono text-zinc-900">
                          {license.license_key}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900">{license.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            license.plan === "test"
                              ? "bg-yellow-100 text-yellow-800"
                              : license.plan === "yearly"
                                ? "bg-blue-100 text-blue-800"
                                : license.plan === "monthly"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {license.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            license.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : license.status === "expired"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {license.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900">
                        <div>
                          {expiresAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div
                          className={`text-xs ${isExpired ? "text-red-600" : daysUntilExpiry <= 7 ? "text-orange-600" : "text-zinc-500"}`}
                        >
                          {isExpired
                            ? "Expired"
                            : daysUntilExpiry <= 0
                              ? "Expires today"
                              : `${daysUntilExpiry} days`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold ${
                            license.active_sessions > 0
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {license.active_sessions}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {license.duplicate_detected && (
                            <span
                              className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800"
                              title="Duplicate usage detected"
                            >
                              🚫 DUP
                            </span>
                          )}
                          {!license.grace_period_allowed && (
                            <span
                              className="inline-flex rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800"
                              title="Grace period disabled"
                            >
                              ⏸️ NO-GRACE
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Activity Log */}
      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Recent Validation Activity</h2>
          <p className="mt-1 text-sm text-zinc-600">Last 50 validation attempts and events</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  License Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Device ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Error Code
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-500">
                    No validation logs found
                  </td>
                </tr>
              ) : (
                recentLogs.map((log: any) => {
                  const timestamp = new Date(log.created_at);
                  return (
                    <tr key={log.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4 text-sm text-zinc-900">
                        {timestamp.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono text-zinc-700">
                          {log.license_key?.substring(0, 20) || "N/A"}...
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            log.event_type === "validation"
                              ? "bg-blue-100 text-blue-800"
                              : log.event_type === "duplicate_detected"
                                ? "bg-red-100 text-red-800"
                                : log.event_type === "deactivation"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {log.event_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono text-zinc-600">
                          {log.device_id?.substring(0, 12) || "N/A"}...
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        {log.success ? (
                          <span className="inline-flex items-center text-sm text-emerald-700">
                            ✓ Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-sm text-red-700">
                            ✗ Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {log.error_code ? (
                          <code className="text-xs font-mono text-red-700">{log.error_code}</code>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Admin Actions Info */}
      <section className="rounded-xl border border-zinc-200 bg-blue-50 p-6">
        <h3 className="mb-2 text-sm font-semibold text-blue-900">Admin Actions Available</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• View all licenses and their active sessions</li>
          <li>• Monitor duplicate detection flags</li>
          <li>• Review validation activity logs</li>
          <li>• Force deactivate sessions via API (coming soon)</li>
          <li>• Revoke licenses manually in Supabase table editor</li>
        </ul>
      </section>
    </div>
  );
}

