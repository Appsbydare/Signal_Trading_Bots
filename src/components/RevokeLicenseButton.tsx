"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RevokeLicenseButtonProps {
    licenseKey: string;
    email: string;
}

export function RevokeLicenseButton({ licenseKey, email }: RevokeLicenseButtonProps) {
    const router = useRouter();
    const [isRevoking, setIsRevoking] = useState(false);

    const handleRevoke = async () => {
        const confirmed = confirm(
            `⚠️ Are you sure you want to REVOKE this license?\n\n` +
            `License: ${licenseKey}\n` +
            `Email: ${email}\n\n` +
            `This will:\n` +
            `• Set license status to 'revoked'\n` +
            `• Deactivate all active sessions\n` +
            `• Prevent future use of this license\n\n` +
            `This action cannot be undone!`
        );

        if (!confirmed) return;

        setIsRevoking(true);

        try {
            const response = await fetch("/api/admin/licenses/revoke", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ licenseKey }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`✅ ${data.message}`);
                router.refresh(); // Refresh the page to show updated status
            } else {
                alert(`❌ Error: ${data.error || "Failed to revoke license"}`);
            }
        } catch (error) {
            alert("❌ An error occurred. Please try again.");
        } finally {
            setIsRevoking(false);
        }
    };

    return (
        <button
            onClick={handleRevoke}
            disabled={isRevoking}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${isRevoking
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
                }`}
            title="Revoke this license and deactivate all sessions"
        >
            {isRevoking ? "Revoking..." : "Revoke"}
        </button>
    );
}
