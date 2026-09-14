import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Page-block image/video/document uploads go through a Server Action.
      // Default cap is 1MB; the editors guard client-side at 5MB for media and
      // 25MB for documents (see `MAX_UPLOAD_LABEL` / `MAX_DOCUMENT_LABEL`).
      // The media library also uploads a whole multi-select batch through one
      // Server Action, capped client-side at 15 files / 60MB total
      // (`MAX_BATCH_FILES` / `MAX_BATCH_BYTES`); this sits above that with
      // headroom for multipart boundary/header overhead.
      bodySizeLimit: "64mb",
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
