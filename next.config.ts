import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Page-block image/video/document uploads go through a Server Action.
      // Default cap is 1MB; the editors guard client-side at 5MB for media and
      // 10MB for documents (see `MAX_UPLOAD_LABEL` / `MAX_DOCUMENT_LABEL`).
      // The media library also uploads a whole multi-select batch through one
      // Server Action, capped client-side at 15 files / 60MB total
      // (`MAX_BATCH_FILES` / `MAX_BATCH_BYTES`); this sits above that with
      // headroom for multipart boundary/header overhead.
      bodySizeLimit: "64mb",
    },
    // `proxy.ts` (matcher: /dashboard/:path*) buffers the request body so both
    // proxy and the Server Action can read it; that buffer defaults to 10MB
    // regardless of `bodySizeLimit` above, silently truncating any larger
    // upload mid-multipart-boundary before the action runs (surfaces as an
    // "Unexpected end of form" throw). Match it to `bodySizeLimit` so uploads
    // up to our own caps aren't corrupted in transit.
    proxyClientMaxBodySize: "64mb",
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
