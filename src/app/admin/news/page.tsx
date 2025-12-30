"use client";

import { useState, useEffect } from "react";

interface AdminItem {
  id: number;
  controlName: string;
  title: string;
  url: string;
}

export default function NewsAdminPage() {
  const [items, setItems] = useState<AdminItem[]>(
    Array.from({ length: 16 }, (_, i) => ({ id: i + 1, controlName: `News${i + 1}`, title: "", url: "" }))
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/news");
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length === 16) {
          setItems(data.items);
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: "controlName" | "title" | "url", value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Data saved successfully!" });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to save data" });
      }
    } catch (error) {
      console.error("Failed to save data:", error);
      setMessage({ type: "error", text: "Failed to save data" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">News Admin</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage news content for the application</p>
      </div>

      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === "success" 
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300" 
              : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-white">Item {index + 1}</div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">Control Name</label>
                <input
                  type="text"
                  value={item.controlName}
                  onChange={(e) => handleChange(index, "controlName", e.target.value)}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                  placeholder={`News${index + 1}`}
                />
                <p className="mt-1 text-xs text-zinc-500">This name maps to the control/widget in your application</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">Title</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleChange(index, "title", e.target.value)}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                  placeholder={`Enter title for item ${index + 1}`}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">URL</label>
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => handleChange(index, "url", e.target.value)}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                  placeholder={`Enter URL for item ${index + 1}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-[#5e17eb] px-6 py-2 text-white transition hover:bg-[#4512c2] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={loadData}
          disabled={loading}
          className="rounded-md border border-zinc-700 bg-zinc-800/50 px-6 py-2 text-white transition hover:bg-zinc-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Reload"}
        </button>
      </div>
    </div>
  );
}

