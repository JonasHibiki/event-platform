// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // UploadThing primary domain (THE MISSING ONE!)
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      // UploadThing backup domains
      {
        protocol: "https",
        hostname: "uploadthing-prod.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https", 
        hostname: "uploadthing-prod-sea1.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "files.uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "*.uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      // UploadThing CDN domains
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      }
    ],
    // Modern format optimization for compressed images
    formats: ['image/avif', 'image/webp'],
    // Additional compression for display
    minimumCacheTTL: 31536000, // 1 year cache for compressed images
  },
  // Enable compression for all responses
  compress: true,
};

export default nextConfig;