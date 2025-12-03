import "server-only";

import { getSupabaseClient } from "@/lib/supabase-storage";

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  tags: string[] | null;
  is_active?: boolean | null;
}

/**
 * Load FAQs that should be visible on the public website.
 * Currently this returns all rows where `is_active` is true, ordered by id.
 */
export async function getPublicFaqs(): Promise<Faq[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("faqs")
    .select("id, question, answer, category, tags, is_active")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("Failed to load public FAQs", error);
    return [];
  }

  return data ?? [];
}


