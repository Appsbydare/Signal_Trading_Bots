import { NextRequest, NextResponse } from "next/server";
import { setPromotionalImage, getPromotionalImage, clearPromotionalImage } from "@/lib/promotional-image";

// GET - Get current promotional image info
export async function GET(request: NextRequest) {
  try {
    const image = getPromotionalImage();
    return NextResponse.json({ 
      hasImage: !!image,
      filename: image?.filename || null,
      contentType: image?.contentType || null,
      url: image ? `/api/app/promotional-image` : null
    });
  } catch (error) {
    console.error("Promotional image fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch promotional image" }, { status: 500 });
  }
}

// POST - Upload promotional image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    // Generate filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `promotional-image-${timestamp}.${extension}`;

    // Store image data
    setPromotionalImage(dataUrl, file.type, filename);

    return NextResponse.json({
      success: true,
      filename,
      url: `/api/app/promotional-image`,
      message: "Image uploaded successfully",
    });
  } catch (error: any) {
    console.error("Promotional image upload error:", error);
    const errorMessage = error?.message || "Failed to upload image";
    return NextResponse.json({ 
      error: "Failed to upload image",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

// DELETE - Remove promotional image
export async function DELETE(request: NextRequest) {
  try {
    clearPromotionalImage();
    return NextResponse.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Promotional image delete error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

