import type { PublicCategory } from "./biblioteca-public-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** How long a built sitemap is reused. Crawlers read it rarely; an hour is plenty. */
const SITEMAP_REVALIDATE_SECONDS = 3600;

export interface SitemapEntry {
  cale: string;
  actualizat: string;
}

export interface SitemapSources {
  pagini: SitemapEntry[];
  articole: SitemapEntry[];
  categorii: PublicCategory[];
}

/**
 * Plain `fetch` rather than `serverApiFetch`: that one reads the session cookie
 * and opts out of caching, and the sitemap is the same anonymous list for every
 * caller, so it is fetched without a token and cached for the hour.
 */
async function readAnonymous<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`${path} answered ${res.status}`);
  return (await res.json()) as T;
}

export async function getSitemapSources(): Promise<SitemapSources> {
  const [{ data: entries }, { data: categorii }] = await Promise.all([
    readAnonymous<{ data: { pagini: SitemapEntry[]; articole: SitemapEntry[] } }>(
      "/api/public/sitemap",
    ),
    readAnonymous<{ data: PublicCategory[] }>("/api/public/library-categories"),
  ]);
  return { ...entries, categorii };
}
