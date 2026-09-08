import DOMPurify from "isomorphic-dompurify";

/**
 * The footer's own allowlist: everything the page-builder's `sanitizeRichText`
 * permits, plus `<img>`, because the footer's editor can insert uploaded
 * images. Kept separate on purpose — widening the shared function would loosen
 * the boundary for every rich-text block in the page builder too.
 *
 * `ALLOWED_URI_REGEXP` limits `src` and `href` to http(s) and site-relative
 * paths, so `javascript:` and inline `data:` payloads never survive.
 */
export function sanitizeFooterRichText(html: string): string {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "h2", "h3", "ul", "ol", "li", "a", "img"],
    // `width` is the plain HTML attribute the editor's size buttons set — no
    // inline styles, so nothing here can smuggle in CSS.
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "width"],
    // Without this, `ALLOWED_URI_REGEXP` is applied to `width` as well and drops
    // it: "280" is not a URI, so every resized image would come back full size.
    ADD_URI_SAFE_ATTR: ["width"],
    ALLOWED_URI_REGEXP: /^(?:https?:\/\/|\/)/i,
  }) as string;

  // DOMPurify allows `data:` on <img> regardless of ALLOWED_URI_REGEXP. The
  // editor is configured with `allowBase64: false`, so this only matters for
  // HTML written straight to the API — but the sink is the sink. Runs on
  // already-normalised output, where attributes are always double-quoted.
  return clean.replace(/\ssrc="data:[^"]*"/gi, "");
}

/** Image styling for footer rich text, on top of the shared prose classes. */
export const FOOTER_IMAGE_PROSE =
  "[&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg";
