import type { MetadataRoute } from "next";
import { getSitemapSources, type SitemapEntry } from "@/lib/api/sitemap";
import { SITE_URL } from "@/lib/site";

// Built per request. A cached sitemap is prerendered at build time, which can
// run before the backend's new code is serving, and a fallback built then is
// kept for the whole revalidate window. Crawlers fetch it rarely; two backend
// reads per fetch is cheap.
export const dynamic = "force-dynamic";

const entry = ({ cale, actualizat }: SitemapEntry): MetadataRoute.Sitemap[number] => ({
  url: `${SITE_URL}${cale}`,
  lastModified: actualizat,
});

/**
 * Everything an anonymous visitor can open: the CMS pages (homepage included,
 * at `/`), the library's category and subcategory pages, and its articles.
 * Drafts and restricted content never reach this list — the backend filters
 * them with the anonymous rule.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { pagini, articole, categorii } = await getSitemapSources();

    const biblioteca = [
      { url: `${SITE_URL}/biblioteca` },
      ...categorii.flatMap((categorie) => [
        { url: `${SITE_URL}/biblioteca/${categorie.slug}` },
        ...categorie.copii.map((sub) => ({
          url: `${SITE_URL}/biblioteca/${categorie.slug}/${sub.slug}`,
        })),
      ]),
    ];

    // `/biblioteca` can also exist as a CMS page; the first entry for a URL
    // wins, so the CMS row keeps its lastModified.
    const seen = new Set<string>();
    return [...pagini.map(entry), ...biblioteca, ...articole.map(entry)].filter(
      ({ url }) => !seen.has(url) && !!seen.add(url),
    );
  } catch (err) {
    // A backend outage must not turn sitemap.xml into a 500 a crawler records;
    // the homepage alone is still a valid sitemap. Logged so the cause shows in
    // the function logs rather than only as a thin sitemap.
    console.error("[sitemap] falling back to the homepage:", err);
    return [{ url: `${SITE_URL}/` }];
  }
}
