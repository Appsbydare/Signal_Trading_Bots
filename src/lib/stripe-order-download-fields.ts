import "server-only";

import type { NextRequest } from "next/server";
import { getDownloadTokensByEmail } from "@/lib/download-tokens";

export async function getDownloadFieldsForPaidOrder(
  email: string,
  licenseKey: string | null | undefined,
  request: NextRequest,
): Promise<{
  downloadUrl: string | null;
  downloadToken: string | null;
  downloadExpired: boolean;
  downloadFileName: string | null;
}> {
  let downloadUrl: string | null = null;
  let downloadToken: string | null = null;
  let downloadExpired = false;
  let downloadFileName: string | null = null;

  if (!licenseKey) {
    return { downloadUrl, downloadToken, downloadExpired, downloadFileName };
  }

  try {
    const tokens = await getDownloadTokensByEmail(email);
    if (tokens && tokens.length > 0) {
      const forThisLicense = tokens.find((t) => t.license_key === licenseKey && !t.is_used);
      const latestToken =
        forThisLicense || tokens.find((t) => !t.is_used) || tokens[0];
      const now = new Date();
      const expiresAt = new Date(latestToken.expires_at);

      if (now <= expiresAt && !latestToken.is_used) {
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        downloadUrl = `${protocol}://${host}/api/download/${latestToken.token}`;
        downloadToken = latestToken.token;
        downloadFileName = latestToken.file_name;
      } else {
        downloadExpired = true;
      }
    }
  } catch (err) {
    console.error("Error fetching download tokens:", err);
  }

  return { downloadUrl, downloadToken, downloadExpired, downloadFileName };
}
