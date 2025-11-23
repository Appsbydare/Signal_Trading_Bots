import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Increase body size limit for image uploads (5MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  // Suppress preload warnings for SVG badges
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
