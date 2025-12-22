"use client";

import { useEffect, useState } from "react";

interface Doc {
  id?: number;
  title: string;
  slug: string;
  content_md: string;
  category?: string;
}

export default function DocsAdminPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const selected = docs.find((d) => d.id === selectedId) ?? null;

  useEffect(() => {
    void loadDocs();
  }, []);

  async function loadDocs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/docs");
      const data = await res.json();
      if (data.success) {
        setDocs(data.docs ?? []);
        if (data.docs?.length && !selectedId) {
          setSelectedId(data.docs[0].id);
        }
      } else {
        setMessage({ type: "error", text: data.message || "Failed to load documents" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load documents" });
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(id: number) {
    setSelectedId(id);
  }

  function handleFieldChange(field: keyof Doc, value: string) {
    if (!selected) return;
    setDocs((prev) => prev.map((d) => (d.id === selected.id ? { ...d, [field]: value } : d)));
  }

  function handleAdd() {
    const tempId = Date.now();
    const newDoc: Doc = {
      id: tempId,
      title: "",
      slug: "",
      content_md: "",
      category: "",
    };
    setDocs((prev) => [newDoc, ...prev]);
    setSelectedId(tempId);
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id && selected.id < 1e12 ? selected.id : undefined,
          title: selected.title,
          slug: selected.slug,
          content_md: selected.content_md,
          category: selected.category,
        }),
      });
      const data = await res.json();
      if (data.success && data.doc) {
        setDocs((prev) =>
          prev.map((d) => (d.id === selected.id ? data.doc : d)),
        );
        setSelectedId(data.doc.id);
        setMessage({ type: "success", text: "Document saved successfully" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save document" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save document" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected || !selected.id) return;
    if (!window.confirm("Delete this document?")) return;

    try {
      const url = new URL("/api/admin/docs", window.location.origin);
      url.searchParams.set("id", String(selected.id));
      const res = await fetch(url.toString(), { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDocs((prev) => prev.filter((d) => d.id !== selected.id));
        setSelectedId(null);
        setMessage({ type: "success", text: "Document deleted" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to delete document" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete document" });
    }
  }

  return (
    <div className="mx-auto max-w-6xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">Knowledge documents</h1>
          <p className="text-sm text-zinc-600">
            Long-form guides that the virtual agents and future AI assistant will use.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#4512c2]"
        >
          Add document
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[2fr,3fr]">
        <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Documents
          </div>
          <div className="max-h-[480px] space-y-1 overflow-y-auto text-sm">
            {loading && docs.length === 0 && (
              <div className="rounded-md bg-zinc-50 p-3 text-xs text-zinc-600">
                Loading…
              </div>
            )}
            {docs.map((doc) => (
              <button
                key={doc.id ?? `temp-${doc.slug}`}
                type="button"
                onClick={() => doc.id && handleSelect(doc.id)}
                className={`block w-full rounded-md px-2 py-1 text-left text-xs ${
                  doc.id === selectedId
                    ? "bg-[#5e17eb]/10 text-[#5e17eb]"
                    : "hover:bg-zinc-100"
                }`}
              >
                {doc.title || <span className="italic text-zinc-400">Untitled document</span>}
              </button>
            ))}
            {!loading && docs.length === 0 && (
              <p className="text-xs text-zinc-500">
                No documents yet. Add your comprehensive app guide or other long-form docs.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-800">Edit document</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !selected}
                className="rounded-md bg-[#5e17eb] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4512c2] disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!selected || !selected.id}
                className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
          {selected ? (
            <div className="space-y-3 text-sm">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700">
                  Title
                </label>
                <input
                  type="text"
                  value={selected.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700">
                  Slug (URL-safe identifier)
                </label>
                <input
                  type="text"
                  value={selected.slug}
                  onChange={(e) => handleFieldChange("slug", e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                  placeholder="app-guide"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700">
                  Category
                </label>
                <input
                  type="text"
                  value={selected.category ?? ""}
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700">
                  Content (Markdown)
                </label>
                <textarea
                  value={selected.content_md}
                  onChange={(e) => handleFieldChange("content_md", e.target.value)}
                  className="min-h-[200px] w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                  placeholder="Use Markdown for headings, bullet points, etc."
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">Select a document on the left to edit it.</p>
          )}
        </div>
      </div>
    </div>
  );
}


