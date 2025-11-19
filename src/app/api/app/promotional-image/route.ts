import { NextRequest, NextResponse } from "next/server";
import { getPromotionalImage } from "@/lib/promotional-image";

// GET - Serve promotional image
export async function GET(request: NextRequest) {
  try {
    const image = getPromotionalImage();
    
    if (!image) {
      return NextResponse.json({ error: "No promotional image available" }, { status: 404 });
    }

    // Extract base64 data from data URL
    const base64Data = image.data.split(",")[1] || image.data;
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": image.contentType,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Promotional image serve error:", error);
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 });
  }
}

