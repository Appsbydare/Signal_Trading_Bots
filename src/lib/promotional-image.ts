// Storage for promotional image (base64 encoded)
// In production, replace with a database or cloud storage

interface PromotionalImageData {
  data: string; // base64 encoded image
  contentType: string; // MIME type
  filename: string; // original filename
  url: string; // URL to redirect when image is clicked
}

let promotionalImage: PromotionalImageData | null = null;

export function getPromotionalImage(): PromotionalImageData | null {
  return promotionalImage;
}

export function setPromotionalImage(data: string, contentType: string, filename: string, url: string): void {
  promotionalImage = { data, contentType, filename, url };
}

export function clearPromotionalImage(): void {
  promotionalImage = null;
}

