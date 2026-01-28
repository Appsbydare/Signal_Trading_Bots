"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type BlogPost = {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: any; // We'll manage this as a JSON string or object
    is_published: boolean;
    cover_image?: string;
};

// Simple Section Type for our structured content
type Section = {
    heading: string;
    body: string;
    bullets: string[];
};

export function BlogEditor({ initialPost, isNew = false }: { initialPost?: any, isNew?: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize state
    const [title, setTitle] = useState(initialPost?.title || "");
    const [slug, setSlug] = useState(initialPost?.slug || "");
    const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
    const [isPublished, setIsPublished] = useState(initialPost?.is_published || false);

    // Content state - Parsing strictly for our "Section" based structure
    // If editing an existing post, try to adapt its content structure
    const initialSections = initialPost?.content?.sections?.map((s: any) => ({
        ...s,
        bullets: s.bullets || []
    })) || [
            { heading: "", body: "", bullets: [] }
        ];
    const [intro, setIntro] = useState(initialPost?.content?.intro || "");
    const [conclusion, setConclusion] = useState(initialPost?.content?.conclusion || "");
    const [sections, setSections] = useState<Section[]>(initialSections);

    // Helper to generate slug from title
    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (isNew && !slug) {
            setSlug(generateSlug(newTitle));
        }
    };

    const addSection = () => {
        setSections([...sections, { heading: "", body: "", bullets: [] }]);
    };

    const updateSection = (index: number, field: keyof Section, value: any) => {
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setSections(newSections);
    };

    const removeSection = (index: number) => {
        setSections(sections.filter((_, i) => i !== index));
    };

    const handleBulletChange = (sectionIndex: number, bulletIndex: number, value: string) => {
        const newSections = [...sections];
        const newBullets = [...newSections[sectionIndex].bullets];
        newBullets[bulletIndex] = value;
        newSections[sectionIndex].bullets = newBullets;
        setSections(newSections);
    };

    const addBullet = (sectionIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].bullets.push("");
        setSections(newSections);
    };

    const removeBullet = (sectionIndex: number, bulletIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].bullets = newSections[sectionIndex].bullets.filter((_, i) => i !== bulletIndex);
        setSections(newSections);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const postData = {
            title,
            slug,
            excerpt,
            is_published: isPublished,
            content: {
                intro,
                sections: sections.filter(s => s.heading || s.body), // Clean up empty sections
                conclusion
            }
        };

        try {
            const url = isNew ? "/api/admin/blog/create" : `/api/admin/blog/update?id=${initialPost.id}`;
            const res = await fetch(url, {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(postData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to save post");

            router.push("/admin/blog");
            router.refresh();
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-20">
            {/* Header Controls */}
            <div className="sticky top-0 z-40 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 backdrop-blur-xl">
                <h2 className="text-xl font-bold text-white">
                    {isNew ? "Create New Article" : "Edit Article"}
                </h2>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-zinc-400">
                        <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={e => setIsPublished(e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-[#5e17eb] focus:ring-[#5e17eb]"
                        />
                        Publish immediately
                    </label>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-[#5e17eb] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#4a11c0] disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Post"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
                    {error}
                </div>
            )}

            {/* Meta Information */}
            <div className="grid gap-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-zinc-500">Article Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="e.g., How to Trade Gold on MT5"
                        className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-lg font-medium text-white placeholder-zinc-600 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                        required
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-zinc-500">Slug (URL)</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={e => setSlug(e.target.value)}
                            placeholder="how-to-trade-gold-mt5"
                            className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-2 text-sm text-zinc-300 font-mono placeholder-zinc-600 focus:border-[#5e17eb] focus:outline-none"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-zinc-500">Excerpt (SEO Description)</label>
                        <input
                            type="text"
                            value={excerpt}
                            onChange={e => setExcerpt(e.target.value)}
                            placeholder="Brief summary for search engines..."
                            className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#5e17eb] focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Content Editor */}
            <div className="space-y-6">
                {/* Intro */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                    <h3 className="mb-4 text-sm font-semibold uppercase text-violet-400">Introduction</h3>
                    <textarea
                        value={intro}
                        onChange={e => setIntro(e.target.value)}
                        className="w-full h-32 rounded-lg border border-zinc-800 bg-black/50 p-4 text-white placeholder-zinc-600 focus:border-[#5e17eb] focus:outline-none"
                        placeholder="Write a compelling introduction..."
                    />
                </div>

                {/* Sections */}
                <div className="space-y-4">
                    {sections.map((section, idx) => (
                        <div key={idx} className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-zinc-700">
                            <button
                                type="button"
                                onClick={() => removeSection(idx)}
                                className="absolute top-4 right-4 text-zinc-500 hover:text-red-400"
                                title="Remove Section"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </button>

                            <h4 className="mb-4 text-xs font-semibold uppercase text-zinc-500">Section {idx + 1}</h4>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={section.heading}
                                    onChange={e => updateSection(idx, "heading", e.target.value)}
                                    placeholder="Section Heading"
                                    className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-2 font-semibold text-white placeholder-zinc-600 focus:border-[#5e17eb] focus:outline-none"
                                />
                                <textarea
                                    value={section.body}
                                    onChange={e => updateSection(idx, "body", e.target.value)}
                                    className="w-full h-24 rounded-lg border border-zinc-800 bg-black/50 p-4 text-sm text-zinc-300 placeholder-zinc-600 focus:border-[#5e17eb] focus:outline-none"
                                    placeholder="Section body text..."
                                />

                                {/* Bullets */}
                                <div className="space-y-2 pl-4 border-l-2 border-zinc-800">
                                    {section.bullets.map((bullet, bIdx) => (
                                        <div key={bIdx} className="flex gap-2">
                                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#5e17eb] flex-shrink-0" />
                                            <input
                                                type="text"
                                                value={bullet}
                                                onChange={e => handleBulletChange(idx, bIdx, e.target.value)}
                                                className="w-full bg-transparent text-sm text-zinc-400 placeholder-zinc-700 outline-none"
                                                placeholder="Bullet point..."
                                            />
                                            <button onClick={() => removeBullet(idx, bIdx)} className="text-zinc-600 hover:text-red-400">×</button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addBullet(idx)}
                                        className="text-xs text-[#5e17eb] hover:text-[#7c3aed] font-medium mt-2"
                                    >
                                        + Add Bullet Point
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addSection}
                        className="w-full rounded-xl border-2 border-dashed border-zinc-800 py-4 text-sm font-medium text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-900/50 transition"
                    >
                        + Add New Content Section
                    </button>
                </div>

                {/* Conclusion */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                    <h3 className="mb-4 text-sm font-semibold uppercase text-violet-400">Conclusion</h3>
                    <textarea
                        value={conclusion}
                        onChange={e => setConclusion(e.target.value)}
                        className="w-full h-32 rounded-lg border border-zinc-800 bg-black/50 p-4 text-white placeholder-zinc-600 focus:border-[#5e17eb] focus:outline-none"
                        placeholder="Wrap up the article..."
                    />
                </div>
            </div>
        </form>
    );
}
