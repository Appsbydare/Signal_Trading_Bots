"use client";

import { useEffect, useState } from "react";

interface Agent {
  id?: number;
  name: string;
  avatar_url?: string;
  description?: string;
  prompt_style?: string;
  is_active: boolean;
}

export default function AgentsAdminPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  useEffect(() => {
    void loadAgents();
  }, []);

  async function loadAgents() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/agents");
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents ?? []);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to load agents" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load agents" });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(index: number, field: keyof Agent, value: string | boolean) {
    setAgents((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function handleAdd() {
    setAgents((prev) => [
      ...prev,
      {
        name: "",
        avatar_url: "",
        description: "",
        prompt_style: "",
        is_active: true,
      },
    ]);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agents }),
      });
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents ?? []);
        setMessage({ type: "success", text: "Agents saved successfully" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save agents" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save agents" });
    } finally {
      setSaving(false);
    }
  }

  if (loading && agents.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-white">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Virtual Agents</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Configure the personas shown in the virtual support chat widget.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-md border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Add agent
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#4512c2] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save all"}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {agents.map((agent, index) => (
          <div
            key={agent.id ?? `new-${index}`}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white">
                Agent {agent.id ?? "new"}
              </div>
              <label className="flex items-center gap-2 text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={agent.is_active}
                  onChange={(e) => handleChange(index, "is_active", e.target.checked)}
                />
                Active
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">Name</label>
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                  placeholder="Alex – Setup Assistant"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">
                  Avatar URL (optional)
                </label>
                <input
                  type="url"
                  value={agent.avatar_url ?? ""}
                  onChange={(e) => handleChange(index, "avatar_url", e.target.value)}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                  placeholder="https://…"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Short description
              </label>
              <input
                type="text"
                value={agent.description ?? ""}
                onChange={(e) => handleChange(index, "description", e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                placeholder="Helps with installation and first-time setup."
              />
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Prompt style / tone (for future AI integration)
              </label>
              <textarea
                value={agent.prompt_style ?? ""}
                onChange={(e) => handleChange(index, "prompt_style", e.target.value)}
                className="min-h-[60px] w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                placeholder="Friendly, concise, focuses on installation and error logs."
              />
            </div>
          </div>
        ))}
        {agents.length === 0 && (
          <p className="text-sm text-zinc-400">
            No agents defined yet. Click &quot;Add agent&quot; to create your first virtual
            persona.
          </p>
        )}
      </div>
    </div>
  );
}


