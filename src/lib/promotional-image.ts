// Storage for promotional image filename
// In production, replace with a database

let promotionalImageFilename: string | null = null;

export function getPromotionalImageFilename(): string | null {
  return promotionalImageFilename;
}

export function setPromotionalImageFilename(filename: string | null): void {
  promotionalImageFilename = filename;
}

