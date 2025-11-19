import { NextRequest, NextResponse } from "next/server";
import { youtubeHelpData } from "@/lib/admin-data";

// GET - Retrieve YouTube help data for the application
export async function GET(request: NextRequest) {
  try {
    // Filter out empty items for the app
    const filteredItems = youtubeHelpData.filter((item) => item.title && item.url);
    return NextResponse.json({ items: filteredItems });
  } catch (error) {
    console.error("App YouTube help fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch YouTube help data" }, { status: 500 });
  }
}

