import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { setPromotionalImageFilename, getPromotionalImageFilename } from "@/lib/promotional-image";

// GET - Get current promotional image info
export async function GET(request: NextRequest) {
  try {
    const filename = getPromotionalImageFilename();
    return NextResponse.json({ 
      filename,
      url: filename ? `/api/app/promotional-image` : null
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `promotional-image-${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Delete old image if exists
    const oldFilename = getPromotionalImageFilename();
    if (oldFilename) {
      try {
        const oldFilepath = join(uploadsDir, oldFilename);
        const { unlink } = await import("fs/promises");
        await unlink(oldFilepath);
      } catch (error) {
        // Old file might not exist, ignore error
        console.warn("Could not delete old image:", error);
      }
    }

    // Update stored filename
    setPromotionalImageFilename(filename);

    return NextResponse.json({
      success: true,
      filename,
      url: `/api/app/promotional-image`,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Promotional image upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

// DELETE - Remove promotional image
export async function DELETE(request: NextRequest) {
  try {
    const filename = getPromotionalImageFilename();
    if (filename) {
      const uploadsDir = join(process.cwd(), "public", "uploads");
      const filepath = join(uploadsDir, filename);
      
      try {
        const { unlink } = await import("fs/promises");
        await unlink(filepath);
      } catch (error) {
        console.warn("Could not delete image file:", error);
      }
      
      setPromotionalImageFilename(null);
    }

    return NextResponse.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Promotional image delete error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

