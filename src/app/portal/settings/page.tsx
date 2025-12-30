import Link from "next/link";
import { getCurrentCustomer } from "@/lib/auth-server";
import { SetPasswordForm } from "@/components/SetPasswordForm";
import { UpdatePersonalInfoForm } from "@/components/UpdatePersonalInfoForm";

export const metadata = {
  title: "Settings | Customer Portal | signaltradingbots",
};

export default async function SettingsPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="mb-4 text-2xl font-semibold text-white">You are not logged in</h1>
        <p className="mb-6 text-sm text-zinc-400">
          Please log in to access your settings.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#4512c2]"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your account security and preferences
          </p>
        </div>
        <Link
          href="/portal"
          className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          ← Back to Portal
        </Link>
      </div>

      {/* Account Security - Set Password */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Account Security</h2>
          <p className="text-sm text-zinc-400">
            {customer.password_set_by_user 
              ? "Update your password to keep your account secure"
              : "Set a password to access your portal without needing a magic link"
            }
          </p>
        </div>
        <SetPasswordForm hasPassword={customer.password_set_by_user} />
      </section>

      {/* Personal Information */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Personal Information</h2>
          <p className="text-sm text-zinc-400">
            Update your name and country for faster checkout
          </p>
        </div>
        <UpdatePersonalInfoForm />
      </section>

      {/* Account Information */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Account Information</h2>
          <p className="text-sm text-zinc-400">
            Your account details
          </p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Email Address</label>
            <p className="text-sm text-white mt-1">{customer.email}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

