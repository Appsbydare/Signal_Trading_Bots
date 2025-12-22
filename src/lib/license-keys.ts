import "server-only";

import crypto from "crypto";

/**
 * Generate an STB-style license key
 * Format: STB#-XXXX-XXXX-XXXX-XXXX (where # is a digit 0-9)
 * 
 * @returns A randomly generated license key
 */
export function generateLicenseKey(): string {
  // Generate random digit 0-9 for the 4th character
  const digit = Math.floor(Math.random() * 10);
  
  // Generate 4 random hex segments
  const parts = Array.from({ length: 4 }, () =>
    crypto.randomBytes(2).toString("hex").toUpperCase()
  );
  
  return `STB${digit}-${parts.join("-")}`;
}

