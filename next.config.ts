import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Vercel Functions hard-cap request bodies at 4.5MB (a platform limit —
    // see https://vercel.com/docs/functions/limitations#request-body-size —
    // that no config here can raise). So the actual file bytes for page-block
    // image/video/document uploads and media-library uploads never go through
    // a Server Action: the browser uploads them directly to Strapi
    // (`lib/api/upload-direct.ts`, authorized via `getUploadAuthAction`), and a
    // Server Action only finalizes with the small resulting JSON (create the
    // media-asset row, register in the library, revalidate). Client-side size
    // guards still apply — 5MB media / 10MB documents / 15 files·60MB batch,
    // see `MAX_UPLOAD_LABEL` / `MAX_DOCUMENT_LABEL` / `MAX_BATCH_*` — those are
    // product limits, not workarounds for this platform cap.
    //
    // `bodySizeLimit` and `proxyClientMaxBodySize` below are generous headroom
    // for whatever small JSON payloads Server Actions still carry; nothing in
    // this app currently needs anywhere near 64mb, they're just not worth
    // tightening without a concrete reason to.
    serverActions: {
      bodySizeLimit: "64mb",
    },
    // `proxy.ts` (matcher: /dashboard/:path*) separately buffers the request
    // body (for both itself and the Server Action) up to this limit — default
    // 10MB regardless of `bodySizeLimit` above — before truncating it, which
    // corrupts a still-larger multipart body (surfaces as an "Unexpected end
    // of form" throw). Matched to `bodySizeLimit` for the same reason.
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
