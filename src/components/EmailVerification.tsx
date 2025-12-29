"use client";

import { useState, FormEvent, useEffect } from "react";

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
}

export function EmailVerification({ email, onVerified }: EmailVerificationProps) {
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Get email provider for inbox button
  const getEmailProvider = (email: string): { name: string; url: string } | null => {
    const domain = email.split("@")[1]?.toLowerCase();
    
    if (domain?.includes("gmail")) {
      return { name: "Gmail", url: "https://mail.google.com" };
    } else if (domain?.includes("outlook") || domain?.includes("hotmail") || domain?.includes("live")) {
      return { name: "Outlook", url: "https://outlook.live.com" };
    } else if (domain?.includes("yahoo")) {
      return { name: "Yahoo", url: "https://mail.yahoo.com" };
    } else if (domain?.includes("icloud") || domain?.includes("me.com")) {
      return { name: "iCloud", url: "https://www.icloud.com/mail" };
    }
    
    return null;
  };

  const emailProvider = getEmailProvider(email);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  async function handleSendCode() {
    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to send code");
        return;
      }

      setCodeSent(true);
      setCountdown(60); // 60 second cooldown
    } catch (err) {
      console.error("Send code error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Invalid code");
        return;
      }

      onVerified();
    } catch (err) {
      console.error("Verify code error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  // Auto-send code when component mounts
  useEffect(() => {
    if (!codeSent) {
      handleSendCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 text-sm">Verify Your Email</h3>
          <p className="mt-1 text-xs text-blue-700">
            We've sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Verification Code Input */}
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Enter 6-Digit Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            required
            className="w-full rounded-md border border-zinc-300 px-4 py-3 text-center text-2xl font-mono font-bold tracking-[0.5em] focus:border-[#5e17eb] focus:outline-none focus:ring-2 focus:ring-[#5e17eb]"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Code expires in 15 minutes
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={verifying || code.length !== 6}
            className="flex-1 rounded-md bg-[#5e17eb] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#4512c2] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? "Verifying..." : "Verify & Continue"}
          </button>

          {emailProvider && (
            <a
              href={emailProvider.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Open {emailProvider.name}
            </a>
          )}
        </div>

        {/* Resend Code */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleSendCode}
            disabled={sending || countdown > 0}
            className="text-sm text-zinc-600 hover:text-[#5e17eb] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              "Sending..."
            ) : countdown > 0 ? (
              `Resend code in ${countdown}s`
            ) : (
              "Didn't receive code? Resend"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

