"use client";

import { useState, FormEvent, useMemo } from "react";

interface SetPasswordFormProps {
  hasPassword?: boolean;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function SetPasswordForm({ hasPassword = false }: SetPasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password validation requirements
  const passwordRequirements = useMemo((): PasswordRequirement[] => {
    return [
      { label: "At least 8 characters", met: newPassword.length >= 8 },
      { label: "Contains uppercase letter", met: /[A-Z]/.test(newPassword) },
      { label: "Contains lowercase letter", met: /[a-z]/.test(newPassword) },
      { label: "Contains number", met: /[0-9]/.test(newPassword) },
    ];
  }, [newPassword]);

  const isPasswordValid = passwordRequirements.every(req => req.met);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    if (!isPasswordValid) {
      setError("Password does not meet all requirements");
      setSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/customer/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword,
          currentPassword: hasPassword ? currentPassword : undefined
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to update password");
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect to portal after 2 seconds to refresh the page and show updated status
      setTimeout(() => {
        window.location.href = "/portal";
      }, 2000);
    } catch (err) {
      console.error("Password update failed", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {!hasPassword && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold text-amber-300 text-sm">Set a Password to Secure Your Account</h3>
              <p className="mt-1 text-xs text-amber-200/80">
                Set a password now so you can log in directly with email and password. Without a password, you'll need to use social login or request a magic link.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300">
          ✓ Password {hasPassword ? 'updated' : 'set'} successfully! Redirecting to portal...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {hasPassword && (
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Enter your current password"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/50"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Enter a strong password"
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/50"
          />

          {/* Password Requirements */}
          {newPassword && (
            <div className="mt-3 space-y-2">
              {passwordRequirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {req.met ? (
                    <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={req.met ? "text-green-400" : "text-zinc-500"}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Re-enter your password"
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/50"
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Passwords do not match
            </p>
          )}
          {confirmPassword && newPassword === confirmPassword && isPasswordValid && (
            <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Passwords match
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || !isPasswordValid || newPassword !== confirmPassword}
          className="w-full rounded-md bg-[#5e17eb] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#4a12bf] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (hasPassword ? "Updating password..." : "Setting password...") : (hasPassword ? "Update Password" : "Set Password")}
        </button>
      </form>
    </div>
  );
}

