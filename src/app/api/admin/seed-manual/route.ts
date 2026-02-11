import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MANUAL_CONTENT } from "@/data/manual-content";

// Admin-only route to seed the manual content
export async function GET(request: NextRequest) {
    // Simple security check (replace with actual admin auth in production)
    // For now, checks for a secret query param if needed, or relies on being an admin route
    // const secret = request.nextUrl.searchParams.get("secret");
    // if (secret !== process.env.ADMIN_SECRET) {
    //   return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    // }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json(
            { success: false, message: "Supabase environment variables missing" },
            { status: 500 }
        );
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        let output = [];

        // Process each section
        for (const section of MANUAL_CONTENT) {
            const category = section.category;

            // 1. Check if category exists or we can just upsert items based on question text
            // Getting existing items to update them or insert new ones
            for (const item of section.items) {

                // Check if an FAQ with this question already exists
                const { data: existing, error: fetchError } = await supabase
                    .from("faqs")
                    .select("id")
                    .eq("question", item.question)
                    .maybeSingle();

                if (fetchError) {
                    console.error(`Error checking FAQ "${item.question}":`, fetchError);
                    continue;
                }

                if (existing) {
                    // Update existing
                    const { error: updateError } = await supabase
                        .from("faqs")
                        .update({
                            answer: item.answer,
                            category: category,
                            tags: item.tags || [],
                            updated_at: new Date().toISOString(),
                            is_active: true
                        })
                        .eq("id", existing.id);

                    if (updateError) {
                        output.push(`Failed to update: ${item.question} (${updateError.message})`);
                    } else {
                        output.push(`Updated: ${item.question}`);
                    }
                } else {
                    // Insert new
                    const { error: insertError } = await supabase
                        .from("faqs")
                        .insert({
                            question: item.question,
                            answer: item.answer,
                            category: category,
                            tags: item.tags || [],
                            is_active: true
                        });

                    if (insertError) {
                        // If it's a PKEY violation, it might be a sequence issue.
                        // We appologize and report it.
                        output.push(`Failed to insert: ${item.question} (${insertError.message})`);
                    } else {
                        output.push(`Inserted: ${item.question}`);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Knowledge base seeding completed",
            details: output
        });

    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: String(error) },
            { status: 500 }
        );
    }
}
