import type { LibraryCategory } from "@/lib/api/library-categories-types";
import type { ResolvedCategory } from "../biblioteca-categorii/schema";

function toCard(category: LibraryCategory): ResolvedCategory {
  return {
    documentId: category.documentId,
    nume: category.nume,
    slug: category.slug,
    descriere: category.descriere,
    icon: category.icon,
    numarArticole: category.numarArticole,
  };
}

/**
 * The canvas twin of the backend's category injection. On the public page the
 * controller fills these in server-side; here the builder does it from the
 * taxonomy it was handed, so an editor sees the block populated while placing
 * it rather than an empty rectangle.
 *
 * The two do NOT agree, on purpose. `listLibraryCategories` is the STAFF tree:
 * its counts include drafts, and it keeps a category that has nothing published
 * in it, because an editor needs to see and manage one. The public read counts
 * only what the visitor may open and drops a category with nothing visible. So
 * the canvas can show a card, or a higher count, that the live page will not.
 *
 * The walk mirrors `resolveBlockLinks`: shape-agnostic, so a block nested inside
 * a Section or a Columns is resolved as well as one at the top level.
 *
 * Recognition takes two routes on purpose. A nested block is matched by its
 * `type`, which the walk can see. The top-level call receives only `block.data`,
 * so its type arrives as `topType` — and failing that, the `categoriiRezolvate`
 * key identifies it. Both are needed: a page saved before this block listed
 * categories has no such key in its stored data, and matching on the key alone
 * would leave it previewing blank until the editor happened to re-save it.
 */
const BLOCK_TYPE = "article-grid";

export function resolveBlockCategories<T>(
  data: T,
  categories: LibraryCategory[],
  topType?: string,
): T {
  const cards = categories.map(toCard);

  const walk = (node: unknown, isBlockData: boolean): unknown => {
    if (Array.isArray(node)) return node.map((child) => walk(child, false));
    if (node === null || typeof node !== "object") return node;

    const record = node as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(record)) {
      // A container keeps its children as whole blocks, so their own `data` is
      // one level down from the block object the walk is standing on.
      next[key] = walk(child, key === "data" && record.type === BLOCK_TYPE);
    }

    if (isBlockData || "categoriiRezolvate" in record) {
      next.categoriiRezolvate = cards;
    }

    return next;
  };

  return walk(data, topType === BLOCK_TYPE) as T;
}
