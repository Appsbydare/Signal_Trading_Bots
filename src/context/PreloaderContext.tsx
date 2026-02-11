"use client";

import React, { createContext, useContext, useState } from "react";

interface PreloaderContextType {
    isPreloaderFinished: boolean;
    finishPreloader: () => void;
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined);

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
    const [isPreloaderFinished, setIsPreloaderFinished] = useState(false);

    const finishPreloader = () => {
        setIsPreloaderFinished(true);
    };

    return (
        <PreloaderContext.Provider value={{ isPreloaderFinished, finishPreloader }}>
            {children}
        </PreloaderContext.Provider>
    );
}

export function usePreloader() {
    const context = useContext(PreloaderContext);
    if (context === undefined) {
        throw new Error("usePreloader must be used within a PreloaderProvider");
    }
    return context;
}
