"use client";

import { useEffect, useState } from "react";

interface Faq {
  id?: number;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

export default function FaqsAdminPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const selectedFaq = faqs.find((f) => f.id === selectedId) ?? null;

  useEffect(() => {
    void loadFaqs();
  }, []);

  async function loadFaqs(query?: string) {
    setLoading(true);
    try {
      const url = new URL("/api/admin/faqs", window.location.origin);
      if (query) url.searchParams.set("search", query);
      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setFaqs(data.faqs ?? []);
        if (data.faqs?.length && !selectedId) {
          setSelectedId(data.faqs[0].id);
        }
      } else {
        setMessage({ type: "error", text: data.message || "Failed to load FAQs" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load FAQs" });
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(id: number) {
    setSelectedId(id);
  }

  function handleFieldChange(field: keyof Faq, value: string) {
    if (!selectedFaq) return;
    setFaqs((prev) =>
      prev.map((f) => (f.id === selectedFaq.id ? { ...f, [field]: value } : f)),
    );
  }

  function handleAdd() {
    const tempId = Date.now();
    const newFaq: Faq = {
      id: tempId,
      question: "",
      answer: "",
      category: "",
    };
    setFaqs((prev) => [newFaq, ...prev]);
    setSelectedId(tempId);
  }

  async function handleSave() {
    if (!selectedFaq) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedFaq.id && selectedFaq.id < 1e12 ? selectedFaq.id : undefined,
          question: selectedFaq.question,
          answer: selectedFaq.answer,
          category: selectedFaq.category,
          tags: selectedFaq.tags,
        }),
      });
      const data = await res.json();
      if (data.success && data.faq) {
        setFaqs((prev) =>
          prev.map((f) => (f.id === selectedFaq.id ? data.faq : f)),
        );
        setSelectedId(data.faq.id);
        setMessage({ type: "success", text: "FAQ saved successfully" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save FAQ" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save FAQ" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedFaq || !selectedFaq.id) return;
    if (!window.confirm("Delete this FAQ?")) return;

    try {
      const url = new URL("/api/admin/faqs", window.location.origin);
      url.searchParams.set("id", String(selectedFaq.id));
      const res = await fetch(url.toString(), { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFaqs((prev) => prev.filter((f) => f.id !== selectedFaq.id));
        setSelectedId(null);
        setMessage({ type: "success", text: "FAQ deleted" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to delete FAQ" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete FAQ" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">FAQs</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage the 200+ questions that power the virtual agent&apos;s quick answers.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void loadFaqs(search);
                }
              }}
              placeholder="Search question…"
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
            />
            <button
              type="button"
              onClick={() => void loadFaqs(search)}
              className="rounded-md border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#4512c2]"
            >
              Add FAQ
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

      <div className="grid gap-6 md:grid-cols-[2fr,3fr]">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Questions
          </div>
          <div className="max-h-[480px] space-y-1 overflow-y-auto text-sm">
            {loading && faqs.length === 0 && (
              <div className="rounded-md bg-zinc-800/50 p-3 text-xs text-zinc-400">
                Loading…
              </div>
            )}
            {faqs.map((faq) => (
              <button
                key={faq.id ?? `temp-${faq.question}`}
                type="button"
                onClick={() => faq.id && handleSelect(faq.id)}
                className={`block w-full rounded-md px-2 py-1 text-left text-xs ${
                  faq.id === selectedId
                    ? "bg-[#5e17eb]/20 text-[#5e17eb]"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {faq.question || <span className="italic text-zinc-500">Untitled question</span>}
              </button>
            ))}
            {!loading && faqs.length === 0 && (
              <p className="text-xs text-zinc-500">No FAQs yet. Click &quot;Add FAQ&quot;.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Edit FAQ</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !selectedFaq}
                className="rounded-md bg-[#5e17eb] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4512c2] disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!selectedFaq || !selectedFaq.id}
                className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
          {selectedFaq ? (
            <div className="space-y-3 text-sm">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">
                  Question
                </label>
                <textarea
                  value={selectedFaq.question}
                  onChange={(e) => handleFieldChange("question", e.target.value)}
                  className="min-h-[60px] w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">Answer</label>
                <textarea
                  value={selectedFaq.answer}
                  onChange={(e) => handleFieldChange("answer", e.target.value)}
                  className="min-h-[120px] w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-300">
                    Category
                  </label>
                  <input
                    type="text"
                    value={selectedFaq.category ?? ""}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                    placeholder="install, licensing, strategies…"
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">Select a question on the left to edit it.</p>
          )}
        </div>
      </div>
    </div>
  );
}


