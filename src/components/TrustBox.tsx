"use client";
import React from "react";
import Link from "next/link";

export function TrustBox() {
    return (
        <Link
            href="https://www.trustpilot.com/review/signaltradingbots.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#00b67a] bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-transform hover:scale-105"
        >
            <span className="font-semibold text-[#1a1a1a]">Review us on</span>
            <div className="flex items-center gap-0.5">
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-[#00b67a]"
                >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span className="font-bold text-[#1a1a1a]">Trustpilot</span>
            </div>
        </Link>
    );
}
