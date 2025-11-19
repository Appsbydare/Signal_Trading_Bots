// Shared storage for admin data
// In production, replace with a database

export interface AdminItem {
  id: number;
  title: string;
  url: string;
}

// YouTube Help Data
let _youtubeHelpData: AdminItem[] = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  title: "",
  url: "",
}));

// News Data
let _newsData: AdminItem[] = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  title: "",
  url: "",
}));

// Export getters
export const youtubeHelpData = _youtubeHelpData;
export const newsData = _newsData;

// Export setters
export function setYouTubeHelpData(items: AdminItem[]) {
  _youtubeHelpData.splice(0, _youtubeHelpData.length, ...items);
}

export function setNewsData(items: AdminItem[]) {
  _newsData.splice(0, _newsData.length, ...items);
}

