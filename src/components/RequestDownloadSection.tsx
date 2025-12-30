"use client";

import { useState } from "react";

export function RequestDownloadSection() {
    const [requesting, setRequesting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleRequestDownload = async () => {
        setRequesting(true);
        setMessage(null);

        try {
            const response = await fetch("/api/portal/request-download", {
                method: "POST",
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: "success",
                    text: data.message || "Download link sent to your email!",
                });
            } else {
                setMessage({
                    type: "error",
                    text: data.error || "Failed to send download link. Please try again.",
                });
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: "An error occurred. Please try again or contact support.",
            });
        } finally {
            setRequesting(false);
        }
    };

    return (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-white">Download Software</h2>
                <p className="text-sm text-zinc-400">
                    Request a secure download link for the TelegramSignalBot Installer
                </p>
            </div>

            <div className="space-y-4">
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-blue-300">How it works:</h3>
                            <ul className="mt-2 space-y-1 text-xs text-blue-200">
                                <li>• Click the button below to request a download link</li>
                                <li>• We'll send a secure link to your email</li>
                                <li>• The link expires in 1 hour and can only be used once</li>
                                <li>• You can request a new link anytime from this page</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleRequestDownload}
                    disabled={requesting}
                    className={`w-full rounded-md px-6 py-3 text-center font-medium text-white transition ${requesting
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-[#5e17eb] hover:bg-[#4512c2]"
                        }`}
                >
                    {requesting ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                        </span>
                    ) : (
                        "Email Me Download Link"
                    )}
                </button>

                {message && (
                    <div
                        className={`rounded-lg p-4 ${message.type === "success"
                            ? "border border-green-500/30 bg-green-500/10"
                            : "border border-red-500/30 bg-red-500/10"
                            }`}
                    >
                        <p
                            className={`text-sm ${message.type === "success" ? "text-green-300" : "text-red-300"
                                }`}
                        >
                            {message.type === "success" ? "✓ " : "⚠ "}
                            {message.text}
                        </p>
                    </div>
                )}

                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                    <p className="text-xs text-amber-200">
                        <strong>Security Note:</strong> For your protection, each download link can only be used once and expires after 1 hour. If you need to download again, simply request a new link.
                    </p>
                </div>
            </div>
        </section>
    );
}
