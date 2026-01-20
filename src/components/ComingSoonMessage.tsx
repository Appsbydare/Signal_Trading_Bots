import React from "react";
import Link from "next/link";

interface ComingSoonMessageProps {
  productName: string;
  productDescription?: string;
}

export function ComingSoonMessage({ productName, productDescription }: ComingSoonMessageProps) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-8 text-center shadow-lg">
      <div className="mb-4 inline-flex rounded-full bg-zinc-700 px-4 py-2">
        <span className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
          Coming Soon
        </span>
      </div>

      <h3 className="mb-3 text-xl font-bold text-white">{productName}</h3>

      {productDescription && (
        <p className="mb-6 text-sm text-zinc-300">{productDescription}</p>
      )}

      <div className="space-y-3">
        <p className="text-sm text-white">
          This product is currently under development.
        </p>
        <p className="text-sm text-white">
          Want to be notified when it launches?
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-md bg-[#5e17eb] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#4512c2] hover:shadow-lg"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
