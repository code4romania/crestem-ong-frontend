import type { PageOption } from "@/lib/api/pages-types";

/**
 * The builder's preview mirrors what the public read does on the backend:
 * rewrite every page-backed link into that page's real path, so a button shows
 * its true address while it is being edited instead of waiting for a save.
 *
 * The walk is shape-agnostic — a link is any object carrying both `href` and
 * `pagina` — so a new block with a CTA needs no change here.
 */
export function resolveBlockLinks<T>(data: T, pages: PageOption[]): T {
  const paths = new Map(pages.map((page) => [page.documentId, page.cale]));

  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk);
    if (node === null || typeof node !== "object") return node;

    const record = node as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(record)) next[key] = walk(child);

    if (typeof record.href === "string" && typeof record.pagina === "string") {
      const pagina = record.pagina.trim();
      if (pagina) next.href = paths.get(pagina) ?? "";
    }

    return next;
  };

  return walk(data) as T;
}
