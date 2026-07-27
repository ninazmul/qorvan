import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io", port: "" },
      { protocol: "https", hostname: "img.clerk.com", port: "" },
      { protocol: "https", hostname: "ufs.sh", port: "" },
      { protocol: "https", hostname: "*.ufs.sh", port: "" },
      { protocol: "https", hostname: "images.unsplash.com", port: "" },
      { protocol: "https", hostname: "plus.unsplash.com", port: "" },
      { protocol: "https", hostname: "**", port: "" },
    ],
  },
};

export default nextConfig;
