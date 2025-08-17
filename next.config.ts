// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // UploadThing domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uploadthing-prod.s3.us-west-2.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https", 
        hostname: "uploadthing-prod-sea1.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "files.uploadthing.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        pathname: "/f/*",
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