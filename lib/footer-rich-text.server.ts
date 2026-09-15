import sanitizeHtml from "sanitize-html";

/**
 * SERVER ONLY — see `components/features/page-builder/rich-text/sanitize.server.ts`
 * for why the sanitiser must not need a DOM. Applied in `getFooter` (read) and
 * `updateFooterAction` (write), so `Footer` renders HTML that is already clean.
 * `FOOTER_IMAGE_PROSE` lives in the shared `prose` module for the same reason.
 *
 * The footer's own allowlist: everything the page-builder's `sanitizeRichText`
 * permits, plus `<img>`, because the footer's editor can insert uploaded
 * images. Kept separate on purpose — widening the shared function would loosen
 * the boundary for every rich-text block in the page builder too.
 *
 * `allowedSchemes` limits `src` and `href` to http(s); a scheme-less path such
 * as `/uploads/x.png` is still allowed, so `javascript:` and inline `data:`
 * payloads never survive. `width` is the plain HTML attribute the editor's size
 * buttons set — no inline styles, so nothing here can smuggle in CSS.
 */
const FOOTER_POLICY: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "h2", "h3", "ul", "ol", "li", "a", "img"],
  allowedAttributes: { "*": ["href", "target", "rel"], img: ["src", "alt", "width"] },
  allowedSchemes: ["http", "https"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
};

export function sanitizeFooterRichText(html: string): string {
  return sanitizeHtml(html, FOOTER_POLICY);
}
