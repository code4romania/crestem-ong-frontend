import { sanitizeRichText } from "@/components/features/page-builder/rich-text/sanitize.server";
import { toRichTextHtml } from "@/components/features/page-builder/rich-text/has-rich-text";
import type { PageBlock } from "./pages-types";

/**
 * SERVER ONLY (it loads DOMPurify — see `sanitize.server.ts`).
 *
 * Rich-text sanitising used to sit in each block's zod schema, which runs in
 * the editor as well as here; that put DOMPurify in the client bundle. The
 * schemas are now DOM-free and this runs at the write boundary instead, where
 * it is an actual control: a client-side transform never was one, since the
 * Server Action is an addressable endpoint a caller can post to directly.
 *
 * `custom-html` is deliberately absent. Its markup is written by FDSC staff and
 * rendered raw on purpose; sanitising it would break the feature.
 */
/**
 * `list[].field` names a field on every item of a repeater array.
 */
const RICH_TEXT_FIELDS: Record<string, readonly string[]> = {
  "rich-text": ["continut"],
  callout: ["text"],
  "image-text": ["text"],
  "category-grid": ["categorii[].descriere"],
  "faq-collection": ["intrebari[].raspuns"],
  "feature-cards": ["descriere", "carduri[].descriere"],
  gallery: ["descriere"],
  "hero-centered": ["subtitlu"],
  "hero-intro": ["textIntroductiv"],
  "hero-large-split": ["subtitlu"],
  "hero-statistics": ["subtitlu"],
  "image-caption": ["legenda"],
  "numbered-process": ["pasi[].text"],
  "people-grid": ["persoane[].descriere"],
  "program-header": ["subtitlu"],
  "programme-grid": ["programe[].descriere"],
  quote: ["citat"],
  "section-header": ["subtitlu"],
  statistics: ["descriere"],
  testimonials: ["testimoniale[].testimonial"],
  timeline: ["etape[].text"],
  video: ["descriere"],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBlockArray(value: unknown): value is PageBlock[] {
  return Array.isArray(value) && value.every((item) => isRecord(item) && "type" in item);
}

/**
 * The two container blocks, which hold `{ id, type, data }` children the same
 * way the page itself does: `section` nests one list, `columns` one per column.
 */
function sanitizeChildren(type: string, data: Record<string, unknown>) {
  if (type === "section" && isBlockArray(data.blocuri)) {
    return { ...data, blocuri: sanitizeBlocks(data.blocuri) };
  }

  if (type === "columns" && Array.isArray(data.coloane)) {
    return {
      ...data,
      coloane: data.coloane.map((column) =>
        isRecord(column) && isBlockArray(column.blocuri)
          ? { ...column, blocuri: sanitizeBlocks(column.blocuri) }
          : column,
      ),
    };
  }

  return data;
}

/**
 * Legacy plain text (fields that used to be textareas) is converted to HTML
 * first, so everything stored from here on is HTML and renders one way.
 */
function cleanField(value: string): string {
  return sanitizeRichText(toRichTextHtml(value));
}

function sanitizeField(data: Record<string, unknown>, field: string) {
  const [list, itemField] = field.split("[].");
  if (itemField === undefined) {
    return typeof data[field] === "string"
      ? { ...data, [field]: cleanField(data[field]) }
      : data;
  }

  const items = data[list];
  if (!Array.isArray(items)) return data;
  return {
    ...data,
    [list]: items.map((item) =>
      isRecord(item) && typeof item[itemField] === "string"
        ? { ...item, [itemField]: cleanField(item[itemField]) }
        : item,
    ),
  };
}

/** Returns a new tree; the caller's blocks are left as they were. */
export function sanitizeBlocks(blocks: PageBlock[]): PageBlock[] {
  return blocks.map((block) => {
    if (!isRecord(block.data)) return block;

    let data = sanitizeChildren(block.type, block.data);

    for (const field of RICH_TEXT_FIELDS[block.type] ?? []) {
      data = sanitizeField(data, field);
    }

    return data === block.data ? block : { ...block, data };
  });
}
