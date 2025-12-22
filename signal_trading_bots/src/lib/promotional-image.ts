import {
  deleteStorageObjects,
  downloadBinaryFile,
  downloadJsonFile,
  getSupabasePublicUrl,
  uploadBinaryFile,
  uploadTextFile,
} from "@/lib/supabase-storage";

interface PromotionalImageMetadata {
  imagePath: string;
  redirectUrl: string;
  filename: string;
  contentType: string;
  updatedAt: string;
}

export interface PromotionalImageDetails extends PromotionalImageMetadata {
  imageUrl: string;
}

const STORAGE_PREFIX = "app";
const PROMOTIONAL_IMAGE_METADATA_FILE = `${STORAGE_PREFIX}/promotional-image.json`;

let _promotionalImageCache: PromotionalImageDetails | null | undefined = undefined;

function mapMetadataToDetails(metadata: PromotionalImageMetadata | null): PromotionalImageDetails | null {
  if (!metadata || !metadata.imagePath) {
    return null;
  }

  return {
    ...metadata,
    imageUrl: getSupabasePublicUrl(metadata.imagePath),
  };
}

function getExtension(contentType: string, filename?: string): string {
  if (contentType.includes("jpeg")) return "jpg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("webp")) return "webp";
  if (filename?.includes(".")) {
    return filename.split(".").pop() || "jpg";
  }
  return "jpg";
}

async function loadMetadata(forceReload: boolean = false): Promise<PromotionalImageDetails | null> {
  if (forceReload) {
    _promotionalImageCache = undefined;
  }

  if (_promotionalImageCache !== undefined) {
    return _promotionalImageCache;
  }

  try {
    const metadata = await downloadJsonFile<PromotionalImageMetadata>(PROMOTIONAL_IMAGE_METADATA_FILE);
    const details = mapMetadataToDetails(metadata);
    _promotionalImageCache = details;
    return details;
  } catch (error) {
    console.error("Error loading promotional image metadata:", error);
    _promotionalImageCache = null;
    return null;
  }
}

export async function getPromotionalImage(forceReload: boolean = false): Promise<PromotionalImageDetails | null> {
  return await loadMetadata(forceReload);
}

export async function setPromotionalImage(
  buffer: Buffer,
  contentType: string,
  filename: string,
  url: string,
): Promise<void> {
  try {
    const existing = await getPromotionalImage();
    const extension = getExtension(contentType, filename);
    const imagePath = `${STORAGE_PREFIX}/promotional-image.${extension}`;

    await uploadBinaryFile(imagePath, buffer, contentType);

    const metadata: PromotionalImageMetadata = {
      imagePath,
      redirectUrl: url || "",
      filename,
      contentType,
      updatedAt: new Date().toISOString(),
    };

    await uploadTextFile(PROMOTIONAL_IMAGE_METADATA_FILE, JSON.stringify(metadata, null, 2));
    _promotionalImageCache = mapMetadataToDetails(metadata);

    if (existing?.imagePath && existing.imagePath !== imagePath) {
      await deleteStorageObjects([existing.imagePath]);
    }
  } catch (error) {
    console.error("Error saving promotional image:", error);
    throw error;
  }
}

export async function updatePromotionalImageUrl(url: string): Promise<void> {
  const existing = await getPromotionalImage(true);
  if (!existing) {
    throw new Error("No promotional image available to update.");
  }

  const metadata: PromotionalImageMetadata = {
    imagePath: existing.imagePath,
    redirectUrl: url || "",
    filename: existing.filename,
    contentType: existing.contentType,
    updatedAt: new Date().toISOString(),
  };

  await uploadTextFile(PROMOTIONAL_IMAGE_METADATA_FILE, JSON.stringify(metadata, null, 2));
  _promotionalImageCache = mapMetadataToDetails(metadata);
}

export async function downloadPromotionalImage(): Promise<{ buffer: Buffer; contentType: string } | null> {
  const metadata = await getPromotionalImage();
  if (!metadata) {
    return null;
  }

  const buffer = await downloadBinaryFile(metadata.imagePath);
  if (!buffer) {
    return null;
  }

  return { buffer, contentType: metadata.contentType };
}

export async function clearPromotionalImage(): Promise<void> {
  const metadata = await getPromotionalImage();
  if (metadata?.imagePath) {
    await deleteStorageObjects([metadata.imagePath, PROMOTIONAL_IMAGE_METADATA_FILE]);
  } else {
    await deleteStorageObjects([PROMOTIONAL_IMAGE_METADATA_FILE]);
  }
  _promotionalImageCache = null;
}

