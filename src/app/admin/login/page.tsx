"use client";

import { useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { Suspense, useMemo, useState } from "react";

function safeAdminRedirectTarget(from: string | null): string {
  if (!from || !from.startsWith("/") || from.startsWith("//")) return "/admin";
  if (!from.startsWith("/admin")) return "/admin";
  if (from === "/admin/login" || from.startsWith("/admin/login?")) return "/admin";
  return from;
}

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = useMemo(
    () => safeAdminRedirectTarget(searchParams.get("from")),
    [searchParams],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to log in");
        return;
      }

      setSuccess(true);
      // Let the success overlay render, then hard-navigate so the new HttpOnly cookie
      // is always sent on the next request (fixes first-click redirect races).
      await new Promise((r) => setTimeout(r, 1100));
      window.location.assign(redirectTo);
    } catch (err) {
      console.error("Admin login failed", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {success && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-300"
          aria-live="polite"
        >
          <div className="pointer-events-none flex flex-col items-center gap-5 px-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 scale-150 rounded-full bg-[#5e17eb]/25 blur-2xl animate-pulse" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#5e17eb]/50 bg-[#5e17eb]/15 shadow-[0_0_40px_-8px_#5e17eb]">
                <svg
                  className="h-10 w-10 animate-in fade-in zoom-in-95 text-violet-300 duration-500 fill-none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold tracking-tight text-white">Signed in</p>
              <p className="text-sm text-zinc-400">Opening your dashboard…</p>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-violet-400/80 animate-bounce"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="relative flex min-h-[80vh] items-center justify-center p-4">
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-[80px]" />

        <div className="relative w-full max-w-[420px] rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent">
              Admin Access
            </h1>
            <p className="text-sm text-zinc-400">Secure login for SignalTradingBots administrators</p>
          </div>

          {error && (
            <div className="animate-in fade-in slide-in-from-top-2 mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="ml-1 text-xs font-medium text-zinc-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 transition-all focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="ml-1 text-xs font-medium text-zinc-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 transition-all focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || success}
              className="mt-2 w-full rounded-lg bg-[#5e17eb] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_-5px_#5e17eb] transition-all hover:bg-[#4d12c2] hover:shadow-[0_0_25px_-5px_#5e17eb] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && !success ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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

    </>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center text-zinc-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
