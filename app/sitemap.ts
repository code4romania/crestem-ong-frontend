import type { MetadataRoute } from "next";
import { getSitemapSources, type SitemapEntry } from "@/lib/api/sitemap";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

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

    return [...pagini.map(entry), ...biblioteca, ...articole.map(entry)];
  } catch {
    // A backend outage must not turn sitemap.xml into a 500 a crawler records;
    // the homepage alone is still a valid sitemap.
    return [{ url: `${SITE_URL}/` }];
  }
}
