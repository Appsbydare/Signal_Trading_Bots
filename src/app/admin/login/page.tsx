"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to log in");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("Admin login failed", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center p-4">
      {/* Abstract Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative w-full max-w-[420px] backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
            Admin Access
          </h1>
          <p className="text-sm text-zinc-400">
            Secure login for SignalTradingBots administrators
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb] transition-all"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb] transition-all"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#5e17eb] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_-5px_#5e17eb] transition-all hover:bg-[#4d12c2] hover:shadow-[0_0_25px_-5px_#5e17eb] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {submitting ? (
              <div className="flex items-center gap-2 justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                Authenticating...
              </div>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-600">
          Protected restricted area. Unauthorized access is prohibited.
        </div>
      </div>
    </div>
  );
}
