"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function RealtimeLicenseTracker() {
    const router = useRouter();

    useEffect(() => {
        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn("Supabase credentials missing for RealtimeLicenseTracker");
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Subscribe to license_sessions table changes
        const channel = supabase
            .channel("admin-realtime-tracker")
            .on(
                "postgres_changes",
                {
                    event: "*", // Listen to INSERT, UPDATE, DELETE
                    schema: "public",
                    table: "license_sessions",
                },
                () => {
                    console.log("[Admin] Detected session change - refreshing data...");
                    router.refresh(); // Soft refresh server components
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "*", // Listen to INSERT, UPDATE, DELETE
                    schema: "public",
                    table: "licenses",
                },
                () => {
                    console.log("[Admin] Detected license change - refreshing data...");
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);

    return null; // Invisible component
}
