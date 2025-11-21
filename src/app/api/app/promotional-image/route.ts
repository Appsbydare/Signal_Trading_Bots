import { NextRequest, NextResponse } from "next/server";
import { downloadPromotionalImage } from "@/lib/promotional-image";

// GET - Serve promotional image
export async function GET(request: NextRequest) {
  try {
    const image = await downloadPromotionalImage();
    if (!image) {
      return NextResponse.json({ error: "No promotional image available" }, { status: 404 });
    }

    // Send as Uint8Array (compatible BodyInit for Response in Node runtime)
    const uint8 = new Uint8Array(image.buffer);
    return new NextResponse(uint8, {
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

