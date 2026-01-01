import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase environment variables are not set");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  tags: string[] | null;
  is_active: boolean;
}

/**
 * Get all distinct FAQ categories from the database
 * @returns Array of category names
 */
export async function getAllCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("faqs")
      .select("category")
      .not("category", "is", null)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    // Extract unique categories
    const categories = [...new Set(data.map((row) => row.category))].filter(
      (cat): cat is string => cat !== null,
    );

    return categories.sort();
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    return [];
  }
}

/**
 * Get FAQs by specific categories
 * @param categories - Array of category names to fetch
 * @returns Array of FAQ objects
 */
export async function getFaqsByCategories(categories: string[]): Promise<FAQ[]> {
  if (categories.length === 0) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("faqs")
      .select("id, question, answer, category, tags, is_active")
      .in("category", categories)
      .eq("is_active", true)
      .order("category", { ascending: true });

    if (error) {
      console.error("Error fetching FAQs by categories:", error);
      return [];
    }

    return data as FAQ[];
  } catch (error) {
    console.error("Error in getFaqsByCategories:", error);
    return [];
  }
}

/**
 * Get FAQ count by category
 * @returns Object mapping category names to FAQ counts
 */
export async function getCategoryCount(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from("faqs")
      .select("category")
      .not("category", "is", null)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching category counts:", error);
      return {};
    }

    // Count FAQs per category
    const counts: Record<string, number> = {};
    for (const row of data) {
      if (row.category) {
        counts[row.category] = (counts[row.category] || 0) + 1;
      }
    }

    return counts;
  } catch (error) {
    console.error("Error in getCategoryCount:", error);
    return {};
  }
}

/**
 * Search FAQs by keyword (fallback for when AI doesn't know categories)
 * @param keyword - Keyword to search for in questions and answers
 * @param limit - Maximum number of results to return
 * @returns Array of FAQ objects
 */
export async function searchFaqs(keyword: string, limit: number = 10): Promise<FAQ[]> {
  try {
    const searchTerm = `%${keyword.toLowerCase()}%`;

    const { data, error } = await supabase
      .from("faqs")
      .select("id, question, answer, category, tags, is_active")
      .eq("is_active", true)
      .or(`question.ilike.${searchTerm},answer.ilike.${searchTerm}`)
      .limit(limit);

    if (error) {
      console.error("Error searching FAQs:", error);
      return [];
    }

    return data as FAQ[];
  } catch (error) {
    console.error("Error in searchFaqs:", error);
    return [];
  }
}

/**
 * Format FAQs for AI context
 * @param faqs - Array of FAQ objects
 * @returns Formatted string for AI prompt
 */
export function formatFaqsForContext(faqs: FAQ[]): string {
  if (faqs.length === 0) {
    return "No relevant FAQs found.";
  }

  let formatted = "";
  let currentCategory = "";

  for (const faq of faqs) {
    // Add category header if it changed
    if (faq.category && faq.category !== currentCategory) {
      currentCategory = faq.category;
      formatted += `\n### ${currentCategory}\n\n`;
    }

    // Add Q&A
    formatted += `**Q**: ${faq.question}\n**A**: ${faq.answer}\n\n`;
  }

  return formatted.trim();
}
