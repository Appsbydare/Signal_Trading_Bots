import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { getPromotionalImageFilename } from "@/lib/promotional-image";

// Configure runtime for file system operations
export const runtime = "nodejs";

// GET - Serve promotional image
export async function GET(request: NextRequest) {
  try {
    const filename = getPromotionalImageFilename();
    
    if (!filename) {
      return NextResponse.json({ error: "No promotional image available" }, { status: 404 });
    }

    const filepath = join(process.cwd(), "public", "uploads", filename);

    try {
      const fileBuffer = await readFile(filepath);
      
      // Determine content type based on file extension
      const extension = filename.split(".").pop()?.toLowerCase();
      const contentTypeMap: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
      };
      const contentType = contentTypeMap[extension || ""] || "image/jpeg";

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
      });
    } catch (error) {
      console.error("Error reading image file:", error);
      return NextResponse.json({ error: "Image file not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Promotional image serve error:", error);
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 });
  }
}

