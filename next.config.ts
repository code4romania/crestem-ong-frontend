import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Page-block image/video/document uploads go through a Server Action.
      // Default cap is 1MB; the editors guard client-side at 5MB for media and
      // 25MB for documents (see `MAX_UPLOAD_LABEL` / `MAX_DOCUMENT_LABEL`). This
      // sits above the document guard to leave headroom for multipart
      // boundary/header overhead.
      bodySizeLimit: "28mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
