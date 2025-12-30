"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/customer/login", {
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

      router.push("/portal");
      router.refresh();
    } catch (err) {
      console.error("Login failed", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMagicLink(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/request-magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMagicLinkSent(true);
      } else {
        setError(data.message || "Failed to send magic link");
      }
    } catch (err) {
      console.error("Magic link request failed", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-400">Customer login</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Log in with the email you used when purchasing your license to view your portal.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {magicLinkSent && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>✓ Magic link sent! Check your email inbox for a secure login link.</span>
          </div>
        </div>
      )}

      {showMagicLink ? (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4512c2] disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send Magic Link"}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowMagicLink(false);
              setMagicLinkSent(false);
              setError(null);
            }}
            className="w-full text-center text-sm text-zinc-500 hover:text-zinc-700"
          >
            ← Back to password login
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4512c2] disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Log in"}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowMagicLink(true);
              setError(null);
            }}
            className="w-full text-center text-sm text-zinc-500 hover:text-zinc-700"
          >
            Don't have a password? Request a magic link →
          </button>
        </form>
      )}
    </div>
  );
}


