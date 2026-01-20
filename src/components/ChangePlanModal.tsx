"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

interface PlanInfo {
    key: string;
    name: string;
    priceId: string;
    amount: number;
    interval: string | null;
}

interface ChangePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    subscriptionId: string;
    currentPlanName: string;
    plans: PlanInfo[];
}

export function ChangePlanModal({
    isOpen,
    onClose,
    onSuccess,
    subscriptionId,
    currentPlanName,
    plans,
}: ChangePlanModalProps) {
    const [mounted, setMounted] = useState(false);
    const [selectedPriceId, setSelectedPriceId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isLoading) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose, isLoading]);

    const handleConfirm = async () => {
        if (!selectedPriceId) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/subscription/change-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subscriptionId,
                    newPriceId: selectedPriceId
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Plan updated successfully");
                onSuccess();
                onClose();
            } else {
                toast.error(data.error || "Failed to update plan");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) return null;

    // Filter out plans that don't have an interval (lifetime) or are the current plan
    // Ideally we might want to allow lifetime upgrade but stripe subscription logic is different for one-time
    // For now, let's stick to subscription plans
    const availablePlans = plans.filter(p => p.interval !== null && p.name !== currentPlanName);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/90 shadow-2xl ring-1 ring-white/10"
                    >
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-white">
                                Change Subscription Plan
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-zinc-400">
                                    Current Plan: <span className="text-white font-medium">{currentPlanName}</span>
                                </p>
                                <p className="text-sm text-zinc-400 mt-1">
                                    Select a new plan for this subscription. Charges will be prorated immediately.
                                </p>
                            </div>

                            <div className="mt-4">
                                <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
                                    New Plan
                                </label>
                                <select
                                    value={selectedPriceId}
                                    onChange={(e) => setSelectedPriceId(e.target.value)}
                                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                    disabled={isLoading}
                                >
                                    <option value="" disabled>Select a plan...</option>
                                    {availablePlans.map((plan) => (
                                        <option key={plan.key} value={plan.priceId}>
                                            {plan.name} - ${plan.amount}/{plan.interval}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="rounded-md border border-zinc-700 bg-transparent px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={isLoading || !selectedPriceId}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Updating...
                                        </span>
                                    ) : (
                                        "Update Plan"
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
