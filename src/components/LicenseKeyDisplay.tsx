"use client";

import { useState } from "react";

interface LicenseKeyDisplayProps {
    licenseKey: string;
}

export function LicenseKeyDisplay({ licenseKey }: LicenseKeyDisplayProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-zinc-300">
                {isVisible ? licenseKey : "••••••••••••••••••••"}
            </code>
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="rounded px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
                title={isVisible ? "Hide license key" : "Show license key"}
            >
                {isVisible ? "Hide" : "Show"}
            </button>
        </div>
    );
}
