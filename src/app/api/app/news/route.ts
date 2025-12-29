import { NextRequest, NextResponse } from "next/server";
import { getNewsItems } from "@/lib/admin-content-db";

// GET - Retrieve News data for the application
export async function GET(request: NextRequest) {
  try {
    const items = await getNewsItems();
    // Filter out empty items for the app and convert to frontend format
    const filteredItems = items
      .filter((item) => item.title && item.url)
      .map(item => ({
        id: item.id,
        controlName: item.control_name,
        title: item.title,
        url: item.url,
      }));
    return NextResponse.json({ items: filteredItems });
  } catch (error) {
    console.error("App News fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch News data" }, { status: 500 });
  }
}

