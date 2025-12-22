import Image from "next/image";

interface CompatibilityBadgeProps {
  type: "telegram" | "mt5";
  className?: string;
}

export default function CompatibilityBadge({
  type,
  className = "",
}: CompatibilityBadgeProps) {
  const config = {
    telegram: {
      src: "/telegram-badge.svg",
      alt: "Telegram Compatible",
      title: "Works with Telegram signals",
    },
    mt5: {
      src: "/mt5-badge.svg",
      alt: "MT5 Supported",
      title: "Executes trades via MetaTrader 5",
    },
  };

  const { src, alt, title } = config[type];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 transition hover:scale-105 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
      title={title}
    >
      <Image src={src} alt={alt} width={24} height={24} />
      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {type === "telegram" ? "Telegram Compatible" : "MT5 Supported"}
      </span>
    </div>
  );
}

