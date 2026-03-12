import { NextRequest, NextResponse } from "next/server";
import {
  setPromotionalImage,
  getPromotionalImage,
  clearPromotionalImage,
  updatePromotionalImageUrl,
} from "@/lib/promotional-image";

// GET - Get current promotional image info
export async function GET(request: NextRequest) {
  try {
    const image = await getPromotionalImage(true);
    return NextResponse.json({
      hasImage: !!image,
      filename: image?.filename || null,
      contentType: image?.contentType || null,
      imageUrl: image?.imageUrl || null,
      redirectUrl: image?.redirectUrl || null,
      apiEndpoint: "/api/app/promotional-image",
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
    const url = (formData.get("url") as string) || "";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic Bytes validation — never trust client-supplied MIME type alone
    const magicBytes = buffer.subarray(0, 12);
    const isJpeg = magicBytes[0] === 0xFF && magicBytes[1] === 0xD8 && magicBytes[2] === 0xFF;
    const isPng  = magicBytes[0] === 0x89 && magicBytes[1] === 0x50 && magicBytes[2] === 0x4E && magicBytes[3] === 0x47;
    const isGif  = magicBytes[0] === 0x47 && magicBytes[1] === 0x49 && magicBytes[2] === 0x46;
    const isWebp = magicBytes[8] === 0x57 && magicBytes[9] === 0x45 && magicBytes[10] === 0x42 && magicBytes[11] === 0x50;
    if (!isJpeg && !isPng && !isGif && !isWebp) {
      return NextResponse.json(
        { error: "File content does not match an allowed image format." },
        { status: 400 }
      );
    }

    await setPromotionalImage(buffer, file.type, file.name, url);

    const saved = await getPromotionalImage(true);

    return NextResponse.json({
      success: true,
      filename: saved?.filename || file.name,
      url: saved?.imageUrl || "/api/app/promotional-image",
      apiEndpoint: "/api/app/promotional-image",
      imageUrl: saved?.imageUrl || null,
      message: "Image uploaded successfully",
      redirectUrl: saved?.redirectUrl || url || "",
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

// PATCH - Update redirect URL only
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    const image = await getPromotionalImage(true);
    if (!image) {
      return NextResponse.json({ error: "No image found. Please upload an image first." }, { status: 400 });
    }

    await updatePromotionalImageUrl(url || "");

    return NextResponse.json({ 
      success: true, 
      message: "URL updated successfully",
      redirectUrl: url || "",
    });
  } catch (error) {
    console.error("Promotional image URL update error:", error);
    return NextResponse.json({ error: "Failed to update URL" }, { status: 500 });
  }
}

// DELETE - Remove promotional image
export async function DELETE(request: NextRequest) {
  try {
    await clearPromotionalImage();
    return NextResponse.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Promotional image delete error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

