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
        ${isActive
          ? "border-blue-600 bg-zinc-700 shadow-lg shadow-blue-500/20"
          : "border-zinc-600 bg-zinc-800 hover:border-zinc-500 hover:shadow-md"
        }
      `}
    >
      {/* Status badge - blue when active, gray when inactive */}
      <span
        className={`text-[10px] font-semibold uppercase tracking-wide ${isActive ? "text-blue-400" : "text-zinc-400"}`}
      >
        {product.status}
      </span>
      <span className={`text-xs font-semibold ${isActive ? "text-white" : "text-zinc-400"}`}>
        {product.name}
      </span>
    </button>
  );
}
