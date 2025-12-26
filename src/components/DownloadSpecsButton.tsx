"use client";

import { useState } from "react";

export function DownloadSpecsButton() {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = () => {
        setIsDownloading(true);

        // Short delay to show the spinner (0.8s) before starting the download
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = '/docs/Mini Bot V13.1_spec_sheet.pdf';
            link.download = 'Mini Bot V13.1_spec_sheet.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsDownloading(false);
        }, 800);
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#5e17eb] active:scale-95 bg-[#5e17eb] text-white hover:bg-[#4a11b8] shadow-sm disabled:opacity-80 disabled:cursor-not-allowed"
        >
            {isDownloading ? (
                <svg className="mr-2 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )}
            {isDownloading ? "Downloading..." : "Download PDF"}
        </button>
    );
}
