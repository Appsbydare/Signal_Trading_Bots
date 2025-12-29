import "server-only";

import { getSupabaseClient } from "./supabase-storage";

// ============================================================================
// TYPES
// ============================================================================

export interface YouTubeHelpItem {
  id: number;
  control_name: string;
  title: string;
  url: string;
  updated_at: string;
}

export interface NewsItem {
  id: number;
  control_name: string;
  title: string;
  url: string;
  updated_at: string;
}

export interface PromotionalImage {
  id: number;
  redirect_url: string | null;
  image_path: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// YOUTUBE HELP ITEMS
// ============================================================================

/**
 * Get all YouTube help items (16 items)
 */
export async function getYouTubeHelpItems(): Promise<YouTubeHelpItem[]> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from("youtube_help_items")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Failed to fetch YouTube help items:", error);
    throw error;
  }

  return (data as YouTubeHelpItem[]) ?? [];
}

/**
 * Update YouTube help items (all 16 items at once)
 */
export async function updateYouTubeHelpItems(items: Array<{
  id: number;
  control_name: string;
  title: string;
  url: string;
}>): Promise<void> {
  const client = getSupabaseClient();
  
  // Update each item individually
  const updatePromises = items.map(item =>
    client
      .from("youtube_help_items")
      .update({
        control_name: item.control_name,
        title: item.title,
        url: item.url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
  );

  const results = await Promise.all(updatePromises);
  
  // Check for errors
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.error("Failed to update YouTube help items:", errors);
    throw new Error("Failed to update some YouTube help items");
  }
}

/**
 * Update a single YouTube help item
 */
export async function updateYouTubeHelpItem(
  id: number,
  data: { control_name?: string; title?: string; url?: string }
): Promise<void> {
  const client = getSupabaseClient();
  
  const updateData: any = { updated_at: new Date().toISOString() };
  if (data.control_name !== undefined) updateData.control_name = data.control_name;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.url !== undefined) updateData.url = data.url;

  const { error } = await client
    .from("youtube_help_items")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Failed to update YouTube help item:", error);
    throw error;
  }
}

// ============================================================================
// NEWS ITEMS
// ============================================================================

/**
 * Get all news items (16 items)
 */
export async function getNewsItems(): Promise<NewsItem[]> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from("news_items")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Failed to fetch news items:", error);
    throw error;
  }

  return (data as NewsItem[]) ?? [];
}

/**
 * Update news items (all 16 items at once)
 */
export async function updateNewsItems(items: Array<{
  id: number;
  control_name: string;
  title: string;
  url: string;
}>): Promise<void> {
  const client = getSupabaseClient();
  
  // Update each item individually
  const updatePromises = items.map(item =>
    client
      .from("news_items")
      .update({
        control_name: item.control_name,
        title: item.title,
        url: item.url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
  );

  const results = await Promise.all(updatePromises);
  
  // Check for errors
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.error("Failed to update news items:", errors);
    throw new Error("Failed to update some news items");
  }
}

/**
 * Update a single news item
 */
export async function updateNewsItem(
  id: number,
  data: { control_name?: string; title?: string; url?: string }
): Promise<void> {
  const client = getSupabaseClient();
  
  const updateData: any = { updated_at: new Date().toISOString() };
  if (data.control_name !== undefined) updateData.control_name = data.control_name;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.url !== undefined) updateData.url = data.url;

  const { error } = await client
    .from("news_items")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Failed to update news item:", error);
    throw error;
  }
}

// ============================================================================
// PROMOTIONAL IMAGES
// ============================================================================

/**
 * Get the active promotional image
 */
export async function getActivePromotionalImage(): Promise<PromotionalImage | null> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from("promotional_images")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch active promotional image:", error);
    throw error;
  }

  return data as PromotionalImage | null;
}

/**
 * Create a new promotional image and deactivate all others
 */
export async function createPromotionalImage(
  imagePath: string,
  redirectUrl: string | null
): Promise<PromotionalImage> {
  const client = getSupabaseClient();
  
  // Deactivate all existing promotional images
  await client
    .from("promotional_images")
    .update({ is_active: false })
    .eq("is_active", true);

  // Create new promotional image
  const { data, error } = await client
    .from("promotional_images")
    .insert({
      image_path: imagePath,
      redirect_url: redirectUrl,
      is_active: true,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create promotional image:", error);
    throw error;
  }
  if (!data) {
    throw new Error("Failed to create promotional image - no data returned");
  }

  return data as PromotionalImage;
}

/**
 * Update promotional image metadata (redirect URL)
 */
export async function updatePromotionalImageMetadata(
  id: number,
  redirectUrl: string | null
): Promise<void> {
  const client = getSupabaseClient();
  
  const { error } = await client
    .from("promotional_images")
    .update({
      redirect_url: redirectUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update promotional image metadata:", error);
    throw error;
  }
}

/**
 * Deactivate a promotional image
 */
export async function deactivatePromotionalImage(id: number): Promise<void> {
  const client = getSupabaseClient();
  
  const { error } = await client
    .from("promotional_images")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to deactivate promotional image:", error);
    throw error;
  }
}


