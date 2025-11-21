import { NextRequest, NextResponse } from "next/server";
import { downloadPromotionalImage } from "@/lib/promotional-image";

// GET - Serve promotional image
export async function GET(request: NextRequest) {
  try {
    const image = await downloadPromotionalImage();
    if (!image) {
      return NextResponse.json({ error: "No promotional image available" }, { status: 404 });
    }

    // Send as Blob to satisfy BodyInit types
    const blob = new Blob([image.buffer], { type: image.contentType || "image/jpeg" });
    return new NextResponse(blob, {
      headers: {
        "Content-Type": image.contentType || "image/jpeg",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Promotional image serve error:", error);
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 });
  }
}

