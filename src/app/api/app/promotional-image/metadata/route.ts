import { NextRequest, NextResponse } from "next/server";
import { getPromotionalImage } from "@/lib/promotional-image";

// GET - Get promotional image metadata (including redirect URL)
export async function GET(request: NextRequest) {
  try {
    const image = await getPromotionalImage(true);

    if (!image) {
      return NextResponse.json({ error: "No promotional image available" }, { status: 404 });
    }

    return NextResponse.json({
      imageUrl: image.imageUrl || "/api/app/promotional-image",
      apiEndpoint: "/api/app/promotional-image",
      redirectUrl: image.redirectUrl || null,
      hasRedirectUrl: !!image.redirectUrl,
    });
  } catch (error) {
    console.error("Promotional image metadata error:", error);
    return NextResponse.json({ error: "Failed to get image metadata" }, { status: 500 });
  }
}

