import DOMPurify from "isomorphic-dompurify";

/**
 * Strict allowlist matching exactly what the rich-text editor can produce
 * (see `RichTextField`). Anything else — `<script>`, `<img>`, `onerror`,
 * `style`, `javascript:` URLs — is stripped. Runs both at the schema boundary
 * (so stored data is already clean) and again in the renderer before the raw
 * HTML sink, since data can reach the renderer without passing through parse.
 */
export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "h2", "h3", "ul", "ol", "li", "a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  }) as string;
}

/** Strip tags + entities to test whether the HTML carries any real text. */
export function hasRichText(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;
}
