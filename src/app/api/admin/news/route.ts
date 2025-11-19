import { NextRequest, NextResponse } from "next/server";
import { newsData, setNewsData } from "@/lib/admin-data";

// GET - Retrieve News data (admin)
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ items: newsData });
  } catch (error) {
    console.error("News fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch News data" }, { status: 500 });
  }
}

// POST - Update News data (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length !== 16) {
      return NextResponse.json(
        { error: "Invalid data. Expected array of 16 items." },
        { status: 400 }
      );
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      if (typeof items[i].title !== "string" || typeof items[i].url !== "string" || typeof items[i].controlName !== "string") {
        return NextResponse.json(
          { error: `Invalid data at index ${i}. Title, URL, and controlName must be strings.` },
          { status: 400 }
        );
      }
    }

    // Update data
    const updatedItems = items.map((item: any, index: number) => ({
      id: index + 1,
      controlName: item.controlName || `News${index + 1}`,
      title: item.title || "",
      url: item.url || "",
    }));
    
    setNewsData(updatedItems);

    return NextResponse.json({ success: true, items: updatedItems });
  } catch (error) {
    console.error("News update error:", error);
    return NextResponse.json({ error: "Failed to update News data" }, { status: 500 });
  }
}

