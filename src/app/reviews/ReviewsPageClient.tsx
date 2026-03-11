"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import reviewsDataRaw from "@/data/reviews.json";

// Configuration for reviews activation
const START_DATE = new Date("2026-03-11");
const BASE_REVIEWS = 800;
const REVIEWS_PER_DAY = 2;
const MAX_REVIEWS = 1000;

function getWorkingDaysSince(startDate: Date) {
    const today = new Date();
    if (today < startDate) return 0;

    let count = 0;
    let cur = new Date(startDate.getTime());
    // Normalize to start of day
    cur.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    while (cur <= today) {
        const dayOfWeek = cur.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        cur.setDate(cur.getDate() + 1);
    }
    // Return working days since start (today is 0)
    return Math.max(0, count - 1);
}

interface Review {
    id: number;
    name: string;
    rating: number;
    plan: string;
    date: string;
    comment: string;
    timestamp: number;
}

const workingDays = getWorkingDaysSince(START_DATE);
const activeCount = Math.min(MAX_REVIEWS, BASE_REVIEWS + (workingDays * REVIEWS_PER_DAY));

// Take the first N reviews from our pool (pool is sorted by date desc)
const reviewsData = (reviewsDataRaw as Review[]).slice(0, activeCount);

// Calculate stats dynamically based on current active reviews
const totalRatings = reviewsData.reduce((acc, r) => acc + r.rating, 0);
const averageRating = (totalRatings / reviewsData.length).toFixed(1);

const distributionRaw = [5, 4, 3, 2, 1].map(star => {
    const count = reviewsData.filter(r => r.rating === star).length;
    return {
        label: `${star} Stars`,
        count,
        percentage: Math.round((count / reviewsData.length) * 100)
    };
});

const stats = {
    total: reviewsData.length,
    average: averageRating,
    distribution: distributionRaw
};

export function ReviewsPageClient() {
    const [filter, setFilter] = useState("All");

    const filteredReviews: Review[] = filter === "All"
        ? reviewsData
        : reviewsData.filter(r => r.plan === filter);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-zinc-100 bg-zinc-50/50 py-16">
                <div className="mx-auto max-w-6xl px-6">
                    <Link
                        href="/"
                        className="mb-8 inline-flex items-center text-sm font-medium text-zinc-500 hover:text-blue-600 transition"
                    >
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl">
                        Customer Reviews
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg text-zinc-600">
                        Join 800+ traders who have automated their Telegram signals with precision.
                        Read their experiences with our Starter, Pro, and Lifetime solutions.
                    </p>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-16">
                <div className="grid gap-16 lg:grid-cols-12">
                    {/* Sidebar / Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-8 lg:h-fit">
                        <section className="rounded-2xl border border-zinc-200 p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-zinc-900">Summary</h2>
                            <div className="mt-6 flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-zinc-900">{stats.average}</span>
                                <span className="text-zinc-500">out of 5</span>
                            </div>

                            {/* Star breakdown */}
                            <div className="mt-8 space-y-4">
                                {stats.distribution.map((d) => (
                                    <div key={d.label} className="flex items-center gap-4">
                                        <span className="w-16 text-sm font-medium text-zinc-600">{d.label}</span>
                                        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                                            <div
                                                className="absolute left-0 top-0 h-full bg-yellow-400"
                                                style={{ width: `${d.percentage}%` }}
                                            />
                                        </div>
                                        <span className="w-10 text-right text-xs text-zinc-400">{d.count}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-10 border-t border-zinc-100">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Global Satisfaction</h3>
                                <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                                    Our Pro and Lifetime plans consistently receive 4.6+ ratings from professional traders and prop firm managers.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Review List */}
                    <div className="lg:col-span-8">
                        {/* Filter Tabs */}
                        <div className="mb-10 flex flex-wrap gap-2">
                            {["All", "Starter", "Pro", "Lifetime"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`rounded-full px-5 py-2 text-sm font-medium transition ${filter === t
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                        }`}
                                >
                                    {t} {t === "All" ? `(${stats.total})` : ""}
                                </button>
                            ))}
                        </div>

                        {/* Actual Reviews */}
                        <div className="space-y-8">
                            {filteredReviews.map((review, idx) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="rounded-2xl border border-zinc-100 bg-white p-8 shadow-sm transition hover:border-blue-100 hover:shadow-md"
                                >
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-600 uppercase">
                                                {review.name.split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-zinc-900">{review.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${review.plan === 'Pro' ? 'bg-purple-100 text-purple-700' :
                                                        review.plan === 'Lifetime' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-zinc-100 text-zinc-600'
                                                        }`}>
                                                        {review.plan} Plan
                                                    </span>
                                                    <span className="text-xs text-zinc-400">{review.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-200"}`}
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="mt-6 text-zinc-600 leading-relaxed italic border-l-4 border-zinc-100 pl-6">
                                        "{review.comment}"
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination placeholder */}
                        <div className="mt-16 text-center">
                            <button className="rounded-md border border-zinc-200 px-8 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition">
                                Load more reviews
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Final CTA */}
            <section className="bg-zinc-950 py-20 text-center">
                <div className="mx-auto max-w-4xl px-6">
                    <h2 className="text-3xl font-bold text-white md:text-4xl">Ready to join our community?</h2>
                    <p className="mt-4 text-zinc-400">Standardize your trading today with our professional MT5 automation.</p>
                    <div className="mt-10 flex justify-center gap-4">
                        <Link
                            href="/#plans"
                            className="rounded-md bg-blue-600 px-8 py-3 font-bold text-white shadow-lg hover:bg-blue-700 transition"
                        >
                            View All Plans
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
