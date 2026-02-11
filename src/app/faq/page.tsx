"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

function FAQContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    // Fetch FAQs from API
    fetch("/api/faqs/public")
      .then((res) => res.json())
      .then((data) => {
        setFaqs(data.faqs || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Auto-select category from URL parameter
  useEffect(() => {
    if (categoryParam && faqs.length > 0) {
      const decodedCategory = decodeURIComponent(categoryParam);
      const categories = Array.from(new Set(faqs.map((faq) => faq.category || "General")));

      // Check if the category exists in the FAQs
      if (categories.includes(decodedCategory)) {
        setSelectedCategory(decodedCategory);
        // Expand categories if the selected one is beyond the initial visible count
        const categoryIndex = categories.indexOf(decodedCategory);
        if (categoryIndex >= 6) {
          setShowAllCategories(true);
        }

        // Scroll to top of page smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [categoryParam, faqs]);

  // Filter FAQs based on search query and selected category
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      (faq.category && faq.category === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Group filtered FAQs by category
  const groupedByCategory = filteredFaqs.reduce<Record<string, FAQ[]>>((acc, faq) => {
    const key = faq.category && faq.category.trim().length > 0 ? faq.category : "General";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(faq);
    return acc;
  }, {});

  // Get unique categories for filter
  const categories = Array.from(new Set(faqs.map((faq) => faq.category || "General")));

  // Limit visible categories
  const MAX_VISIBLE_CATEGORIES = 6;
  const visibleCategories = showAllCategories ? categories : categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const hasMoreCategories = categories.length > MAX_VISIBLE_CATEGORIES;

  // Google recommends limiting FAQ rich results to a reasonable number of Q&As.
  const schemaFaqs = faqs.slice(0, 50);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: schemaFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="space-y-8">
      <h1 className="reveal brand-heading text-2xl font-semibold tracking-tight">FAQ</h1>

      {/* Category Selection Indicator */}
      {categoryParam && selectedCategory !== "all" && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-300">
                  Showing FAQs for: <span className="font-semibold">{selectedCategory}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedCategory("all");
                window.history.replaceState({}, '', '/faq');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 underline font-medium whitespace-nowrap"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === "all"
                ? "bg-[#5e17eb] text-white shadow-lg shadow-[#5e17eb]/30"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700"
              }`}
          >
            All Categories
          </button>
          {visibleCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === category
                  ? "bg-[#5e17eb] text-white shadow-lg shadow-[#5e17eb]/30"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700"
                }`}
            >
              {category}
            </button>
          ))}
          {hasMoreCategories && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700 flex items-center gap-2"
            >
              {showAllCategories ? (
                <>
                  <span>Show Less</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Show All ({categories.length - MAX_VISIBLE_CATEGORIES} more)</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {filteredFaqs.length === 1 ? "1 result found" : `${filteredFaqs.length} results found`}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 animate-spin text-[#5e17eb]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm text-zinc-400">Loading FAQs...</span>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredFaqs.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-zinc-400 mb-2">No FAQs found</p>
          <p className="text-sm text-zinc-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* FAQ List */}
      {!loading && filteredFaqs.length > 0 && (
        <div className="space-y-10">
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <section key={category} className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="h-1 w-8 bg-gradient-to-r from-[#5e17eb] to-[#4512c2] rounded-full"></span>
                {category}
                <span className="ml-2 text-sm font-normal text-zinc-500">({items.length})</span>
              </h2>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-[#5e17eb] bg-zinc-900/90 p-5 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md hover:shadow-[#5e17eb]/20"
                  >
                    <p className="mb-3 text-lg font-semibold text-white">
                      {searchQuery ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: item.question.replace(
                              new RegExp(searchQuery, "gi"),
                              (match) => `<mark class="bg-[#5e17eb]/30 text-white rounded px-1">${match}</mark>`
                            ),
                          }}
                        />
                      ) : (
                        item.question
                      )}
                    </p>
                    <p className="text-sm leading-relaxed text-zinc-300">
                      {searchQuery ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: item.answer.replace(
                              new RegExp(searchQuery, "gi"),
                              (match) => `<mark class="bg-[#5e17eb]/30 text-white rounded px-1">${match}</mark>`
                            ),
                          }}
                        />
                      ) : (
                        item.answer
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {/* SEO: FAQPage structured data for rich results */}
      {!loading && faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          suppressHydrationWarning
        />
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <svg className="h-6 w-6 animate-spin text-[#5e17eb]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-zinc-400">Loading FAQ...</span>
        </div>
      </div>
    }>
      <FAQContent />
    </Suspense>
  );
}