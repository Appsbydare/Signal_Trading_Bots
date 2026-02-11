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
 * Fuzzy match requested categories to actual database categories
 * Handles cases where AI requests "Telegram Setup" but DB has "Telegram Configuration"
 * @param requestedCategories - Categories requested by AI
 * @param availableCategories - Actual categories in database
 * @returns Matched category names from database
 */
function fuzzyMatchCategories(
  requestedCategories: string[],
  availableCategories: string[],
): string[] {
  const matched: string[] = [];

  for (const requested of requestedCategories) {
    const requestedLower = requested.toLowerCase();

    // First try exact match (case-insensitive)
    const exactMatch = availableCategories.find(
      (cat) => cat.toLowerCase() === requestedLower,
    );
    if (exactMatch) {
      matched.push(exactMatch);
      continue;
    }

    // Then try partial match (contains or is contained by)
    const partialMatch = availableCategories.find((cat) => {
      const catLower = cat.toLowerCase();
      return catLower.includes(requestedLower) || requestedLower.includes(catLower);
    });
    if (partialMatch) {
      matched.push(partialMatch);
      continue;
    }

    // Finally, try keyword matching
    const requestedKeywords = requestedLower.split(/[\s&]+/);
    const keywordMatch = availableCategories.find((cat) => {
      const catKeywords = cat.toLowerCase().split(/[\s&]+/);
      // Match if at least 2 keywords overlap, or 1 keyword if it's significant
      const overlap = requestedKeywords.filter((kw) =>
        catKeywords.some((ck) => ck.includes(kw) || kw.includes(ck)),
      );
      return overlap.length >= Math.min(2, requestedKeywords.length);
    });
    if (keywordMatch) {
      matched.push(keywordMatch);
    }
  }

  return [...new Set(matched)]; // Remove duplicates
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
    // Get all available categories for fuzzy matching
    const availableCategories = await getAllCategories();

    // Fuzzy match requested categories to actual database categories
    const matchedCategories = fuzzyMatchCategories(categories, availableCategories);

    if (matchedCategories.length === 0) {
      console.warn(`No category matches found for: ${categories.join(", ")}`);
      return [];
    }

    // Log the matching for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("Category matching:", {
        requested: categories,
        matched: matchedCategories,
      });
    }

    const { data, error } = await supabase
      .from("faqs")
      .select("id, question, answer, category, tags, is_active")
      .in("category", matchedCategories)
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
