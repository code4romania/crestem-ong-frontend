import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Crawlers stay out of the signed-in app and the one-time token links; neither
// has anything a search result should point at. This is a request to crawlers,
// not access control — the dashboard is still guarded by the session.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/api",
        "/resetare-parola",
        "/schimbare-email",
        "/transfer-admin",
        "/membru/activare",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
