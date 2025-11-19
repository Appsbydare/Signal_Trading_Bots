"use client";

import { useState, useEffect } from "react";

interface AdminItem {
  id: number;
  title: string;
  url: string;
}

export default function YouTubeHelpAdminPage() {
  const [items, setItems] = useState<AdminItem[]>(
    Array.from({ length: 16 }, (_, i) => ({ id: i + 1, title: "", url: "" }))
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
      const response = await fetch("/api/admin/youtube-help");
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

  const handleChange = (index: number, field: "title" | "url", value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/youtube-help", {
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
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">YouTube Help Files - Admin</h1>
        <p className="text-zinc-600">Manage YouTube help content for the application</p>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-md p-4 ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-zinc-700">Item {index + 1}</div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">Title</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleChange(index, "title", e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                  placeholder={`Enter title for item ${index + 1}`}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">URL</label>
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => handleChange(index, "url", e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
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
          className="rounded-md border border-zinc-300 bg-white px-6 py-2 text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Reload"}
        </button>
      </div>
    </div>
  );
}

