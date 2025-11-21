// Shared storage for admin data using JSON files
import { downloadJsonFile, uploadTextFile } from "@/lib/supabase-storage";

export interface AdminItem {
  id: number;
  controlName: string;
  title: string;
  url: string;
}

const STORAGE_PREFIX = "app";
const YOUTUBE_HELP_FILE = `${STORAGE_PREFIX}/youtube-help.json`;
const NEWS_FILE = `${STORAGE_PREFIX}/news.json`;

// Cache for in-memory access
let _youtubeHelpDataCache: AdminItem[] | null = null;
let _newsDataCache: AdminItem[] | null = null;

type AdminDataPayload = { items: AdminItem[] } | AdminItem[];

async function fetchAdminData(path: string, controlPrefix: "Help" | "News"): Promise<AdminItem[]> {
  const data = await downloadJsonFile<AdminDataPayload>(path);
  if (data && Array.isArray(data)) {
    return ensureSixteenItems(data, controlPrefix);
  }

  if (data && !Array.isArray(data) && Array.isArray(data.items)) {
    return ensureSixteenItems(data.items, controlPrefix);
  }

  return ensureSixteenItems([], controlPrefix);
}

function ensureSixteenItems(items: AdminItem[], prefix: "Help" | "News"): AdminItem[] {
  const filled = [...items];
  for (let i = 0; i < 16; i += 1) {
    const index = filled.findIndex((item) => item.id === i + 1);
    if (index === -1) {
      filled.push({
        id: i + 1,
        controlName: `${prefix}${i + 1}`,
        title: "",
        url: "",
      });
    } else {
      filled[index] = {
        id: i + 1,
        controlName: filled[index].controlName || `${prefix}${i + 1}`,
        title: filled[index].title || "",
        url: filled[index].url || "",
      };
    }
  }

  // Sort by id to keep consistent order
  return filled.sort((a, b) => a.id - b.id).slice(0, 16);
}

// Load YouTube Help data from JSON file
async function loadYouTubeHelpData(): Promise<AdminItem[]> {
  if (_youtubeHelpDataCache) {
    return _youtubeHelpDataCache;
  }

  try {
    const data = await fetchAdminData(YOUTUBE_HELP_FILE, "Help");
    _youtubeHelpDataCache = data;
    return data;
  } catch (error) {
    console.error("Error loading YouTube Help data:", error);
    const fallback = ensureSixteenItems([], "Help");
    _youtubeHelpDataCache = fallback;
    return fallback;
  }
}

// Load News data from JSON file
async function loadNewsData(): Promise<AdminItem[]> {
  if (_newsDataCache) {
    return _newsDataCache;
  }

  try {
    const data = await fetchAdminData(NEWS_FILE, "News");
    _newsDataCache = data;
    return data;
  } catch (error) {
    console.error("Error loading News data:", error);
    const fallback = ensureSixteenItems([], "News");
    _newsDataCache = fallback;
    return fallback;
  }
}

// Export getters (async)
export async function getYouTubeHelpData(): Promise<AdminItem[]> {
  return await loadYouTubeHelpData();
}

export async function getNewsData(): Promise<AdminItem[]> {
  return await loadNewsData();
}

// Export setters (async - saves to file)
export async function setYouTubeHelpData(items: AdminItem[]): Promise<void> {
  try {
    const payload = JSON.stringify({ items }, null, 2);
    await uploadTextFile(YOUTUBE_HELP_FILE, payload);
    _youtubeHelpDataCache = ensureSixteenItems(items, "Help");
  } catch (error) {
    console.error("Error saving YouTube Help data:", error);
    throw error;
  }
}

export async function setNewsData(items: AdminItem[]): Promise<void> {
  try {
    const payload = JSON.stringify({ items }, null, 2);
    await uploadTextFile(NEWS_FILE, payload);
    _newsDataCache = ensureSixteenItems(items, "News");
  } catch (error) {
    console.error("Error saving News data:", error);
    throw error;
  }
}

// All data access should use the async functions: getYouTubeHelpData() and getNewsData()

