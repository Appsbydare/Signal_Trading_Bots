import { NextRequest, NextResponse } from "next/server";
import { getNewsItems, updateNewsItems } from "@/lib/admin-content-db";

// GET - Retrieve News data (admin)
export async function GET(request: NextRequest) {
  try {
    const items = await getNewsItems();
    // Convert to format expected by frontend
    const formattedItems = items.map(item => ({
      id: item.id,
      controlName: item.control_name,
      title: item.title,
      url: item.url,
    }));
    return NextResponse.json({ items: formattedItems });
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

    // Update data in database
    const updatedItems = items.map((item: any, index: number) => ({
      id: index + 1,
      control_name: item.controlName || `News${index + 1}`,
      title: item.title || "",
      url: item.url || "",
    }));
    
    await updateNewsItems(updatedItems);

    // Return in frontend format
    const formattedItems = updatedItems.map(item => ({
      id: item.id,
      controlName: item.control_name,
      title: item.title,
      url: item.url,
    }));

    return NextResponse.json({ success: true, items: formattedItems });
  } catch (error) {
    console.error("News update error:", error);
    return NextResponse.json({ error: "Failed to update News data" }, { status: 500 });
  }
}

