import React from "react";

interface ProductTabPillProps {
  product: {
    id: string;
    name: string;
    status: string;
    statusTone: string;
  };
  isActive: boolean;
  onClick: () => void;
}

export function ProductTabPill({ product, isActive, onClick }: ProductTabPillProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-all duration-200
        ${
          isActive
            ? "border-blue-600 bg-gradient-to-br from-slate-900 to-black shadow-lg shadow-blue-500/20"
            : "border-zinc-700 bg-gradient-to-br from-zinc-900 to-black hover:border-zinc-600 hover:shadow-md"
        }
      `}
    >
      <span
        className={`text-[10px] font-semibold uppercase tracking-wide ${
          product.statusTone === "primary"
            ? "text-blue-400"
            : "text-zinc-500"
        }`}
      >
        {product.status}
      </span>
      <span className={`text-xs font-semibold ${isActive ? "text-white" : "text-zinc-400"}`}>
        {product.name}
      </span>
    </button>
  );
}
