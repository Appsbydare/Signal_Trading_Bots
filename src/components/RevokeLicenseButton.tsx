"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ConfirmationModal } from "@/components/ConfirmationModal";

interface RevokeLicenseButtonProps {
    licenseKey: string;
    email: string;
}

export function RevokeLicenseButton({ licenseKey, email }: RevokeLicenseButtonProps) {
    const router = useRouter();
    const [isRevoking, setIsRevoking] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleConfirmRevoke = async () => {
        setIsRevoking(true);

        try {
            const response = await fetch("/api/admin/licenses/revoke", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ licenseKey }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setShowConfirm(false);
                router.refresh();
            } else {
                toast.error(data.error || "Failed to revoke license");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsRevoking(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={isRevoking}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${isRevoking
                    ? "bg-orange-600 text-white cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                title="Revoke this license and deactivate all sessions"
            >
                {isRevoking ? "Pending..." : "Revoke"}
            </button>

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirmRevoke}
                title="Revoke License?"
                message={`Are you sure you want to REVOKE this license for ${email}? This will deactivate all sessions and prevent future use. This action cannot be undone.`}
                confirmLabel="Yes, Revoke License"
                cancelLabel="Cancel"
                isDestructive={true}
                isLoading={isRevoking}
            />
        </>
    );
}
