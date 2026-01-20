"use client";

import { useState, useEffect } from "react";
import { CountrySelect } from "./CountrySelect";

export function UpdatePersonalInfoForm() {
  const [formData, setFormData] = useState({
    name: "",
    country: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch current customer data
  useEffect(() => {
    fetch("/api/auth/customer/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.customer) {
          setFormData({
            name: data.customer.name || "",
            country: data.customer.country || "",
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/customer/update-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Personal information updated successfully!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update information" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-[#5e17eb] border-r-transparent"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`rounded-lg border p-4 ${
            message.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm text-zinc-300">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-zinc-500">
          This will be used to pre-fill payment forms
        </p>
      </div>

      <div>
        <label htmlFor="country" className="mb-1 block text-sm text-zinc-300">
          Country
        </label>
        <CountrySelect
          value={formData.country}
          onChange={(value) => setFormData({ ...formData, country: value })}
        />
        <p className="mt-1 text-xs text-zinc-500">
          This will be used to pre-fill payment forms
        </p>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4512c2] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

