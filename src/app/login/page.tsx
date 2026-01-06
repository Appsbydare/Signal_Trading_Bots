"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [showMagicLinkForm, setShowMagicLinkForm] = useState(false);

  const supabase = createClient();

  async function handleEmailLogin(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { parse: parseUrl } = await import("url"); // Dynamic import if needed, or just use strings

      // 1. Supabase Auth Login
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setSubmitting(false);
        return;
      }

      // 2. Sync Session with Legacy System
      const syncResponse = await fetch("/api/auth/sync-session", {
        method: "POST",
      });

      if (!syncResponse.ok) {
        setError("Failed to sync session. Please try again.");
        setSubmitting(false);
        return;
      }

      // 3. Redirect
      router.push("/portal");
      router.refresh();
    } catch (err) {
      console.error("Login failed", err);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  async function handleSocialLogin(provider: "google" | "github") {
    setError(null);
    setSocialLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://signaltradingbots.com"}/auth/callback?next=/portal`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Social login failed", err);
      setError(err.message || "Failed to initiate social login");
      setSocialLoading(null);
    }
  }

  async function handleMagicLink(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMagicLinkSent(false);

    try {
      const response = await fetch("/api/auth/request-magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: magicLinkEmail }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to send magic link");
        setSubmitting(false);
        return;
      }

      setMagicLinkSent(true);
      setSubmitting(false);
    } catch (err) {
      console.error("Magic link request failed", err);
      setError("Something went wrong. Please try again.");
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
            Welcome Back
          </h1>
          <p className="text-sm text-zinc-400">
            Sign in to access your trading dashboard
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

        <div className="space-y-4 mb-6">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            disabled={submitting || socialLoading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {socialLoading === "google" ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <GoogleIcon className="h-5 w-5" />
            )}
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("github")}
            disabled={submitting || socialLoading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {socialLoading === "github" ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <GithubIcon className="h-5 w-5 fill-white" />
            )}
            Continue with GitHub
          </button>

          <button
            type="button"
            onClick={() => {
              setShowMagicLinkForm(true);
              setTimeout(() => {
                const magicSection = document.getElementById('magic-link-section');
                if (magicSection) {
                  magicSection.scrollIntoView({ behavior: 'smooth' });
                  const input = magicSection.querySelector('input');
                  if (input) input.focus();
                }
              }, 100);
            }}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Magic Link
          </button>
        </div>


        {/* Magic Link Section */}
        {showMagicLinkForm && (
          <div id="magic-link-section" className="mb-6">
            {magicLinkSent ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium">Magic link sent!</p>
                    <p className="mt-1 text-xs text-emerald-300">Check your email inbox for a secure login link.</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 ml-1">Email for Magic Link</label>
                  <input
                    type="email"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb] transition-all"
                    placeholder="name@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-zinc-700 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Magic Link"
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0b0c15] px-2 text-zinc-500">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb] transition-all"
              placeholder="name@example.com"
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
                Logging in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-zinc-500">
            Don't have an account?{" "}
            <a href="/register" className="text-[#5e17eb] hover:text-[#7839ee] font-medium transition-colors">
              Create one here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}
