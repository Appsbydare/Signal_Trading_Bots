"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ConfirmationModal } from "@/components/ConfirmationModal";

interface SubscriptionActionsProps {
    subscriptionId: string;
    status: string;
    cancelAtPeriodEnd: boolean;
}

export function SubscriptionActions({ subscriptionId, status, cancelAtPeriodEnd }: SubscriptionActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => Promise<void> | void;
        isDestructive?: boolean;
        confirmLabel?: string;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
    });

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    const handleCancel = () => {
        setConfirmModal({
            isOpen: true,
            title: "Cancel Subscription?",
            message: "Are you sure you want to cancel your subscription? You will retain access until the end of the current billing period.",
            confirmLabel: "Yes, Cancel Subscription",
            isDestructive: true,
            onConfirm: async () => {
                setLoading(true);
                try {
                    const res = await fetch("/api/subscription/cancel", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ subscriptionId }),
                    });

                    if (!res.ok) {
                        throw new Error("Failed to cancel subscription");
                    }

                    toast.success("Subscription canceled successfully");
                    router.refresh();
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to cancel subscription. Please try again.");
                } finally {
                    setLoading(false);
                    closeConfirmModal();
                }
            }
        });
    };

    const handleReactivate = () => {
        setConfirmModal({
            isOpen: true,
            title: "Reactivate Subscription?",
            message: "Do you want to reactivate your subscription? Standard billing will resume.",
            confirmLabel: "Reactivate Subscription",
            isDestructive: false,
            onConfirm: async () => {
                setLoading(true);
                try {
                    const res = await fetch("/api/subscription/reactivate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ subscriptionId }),
                    });

                    if (!res.ok) {
                        throw new Error("Failed to reactivate subscription");
                    }

                    toast.success("Subscription reactivated successfully");
                    router.refresh();
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to reactivate subscription. Please try again.");
                } finally {
                    setLoading(false);
                    closeConfirmModal();
                }
            }
        });
    };

    const isCanceled = status === 'canceled';

    if (isCanceled) {
        return (
            <div className="text-sm text-zinc-400">
                This subscription has been fully canceled and is no longer active.
                <br />
                <a href="/products" className="text-[#5e17eb] hover:underline mt-2 inline-block">Purchase a new subscription</a>
            </div>
        );
    }

    return (
        <>
            {cancelAtPeriodEnd ? (
                <div>
                    <button
                        onClick={handleReactivate}
                        disabled={loading}
                        className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                    >
                        {loading ? "Processing..." : "Reactivate Subscription"}
                    </button>
                    <p className="mt-2 text-xs text-zinc-400">
                        Your subscription is set to cancel at the end of the billing period. Click above to keep it active.
                    </p>
                </div>
            ) : (
                <div>
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="w-full rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition"
                    >
                        {loading ? "Processing..." : "Cancel Subscription"}
                    </button>
                    <p className="mt-2 text-xs text-zinc-400">
                        Cancellation takes effect at the end of your current billing period. You will retain access until then.
                    </p>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
                confirmLabel={confirmModal.confirmLabel}
                isLoading={loading}
            />
        </>
    );
}
