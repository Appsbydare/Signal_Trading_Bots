import { NextRequest, NextResponse } from "next/server";
import { getPromotionalImage } from "@/lib/promotional-image";

// GET - Get promotional image metadata (including redirect URL)
export async function GET(request: NextRequest) {
  try {
    const image = getPromotionalImage();
    
    if (!image) {
      return NextResponse.json({ error: "No promotional image available" }, { status: 404 });
    }

    return NextResponse.json({
      imageUrl: "/api/app/promotional-image",
      redirectUrl: image.url || null,
      hasRedirectUrl: !!image.url,
    });
  } catch (error) {
    console.error("Promotional image metadata error:", error);
    return NextResponse.json({ error: "Failed to get image metadata" }, { status: 500 });
  }
}

