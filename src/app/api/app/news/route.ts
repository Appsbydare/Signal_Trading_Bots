import { NextRequest, NextResponse } from "next/server";
import { newsData } from "@/lib/admin-data";

// GET - Retrieve News data for the application
export async function GET(request: NextRequest) {
  try {
    // Filter out empty items for the app
    const filteredItems = newsData.filter((item) => item.title && item.url);
    return NextResponse.json({ items: filteredItems });
  } catch (error) {
    console.error("App News fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch News data" }, { status: 500 });
  }
}

