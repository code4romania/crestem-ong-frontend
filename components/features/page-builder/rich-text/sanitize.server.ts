import sanitizeHtml from "sanitize-html";

/**
 * SERVER ONLY. Sanitising is a trust-boundary job: it runs on the way to the
 * backend (the page/article/user Server Actions) and on the way out of it for
 * the sinks that predate that, never in a component. Client code takes HTML
 * that is already clean, and the DOM-free `hasRichText` lives in
 * `./has-rich-text` for both sides.
 *
 * `sanitize-html` rather than `isomorphic-dompurify`: DOMPurify needs a DOM, so
 * outside the browser it loads `jsdom`, which Turbopack can only externalise
 * behind a hashed shim in `.next/node_modules` whose symlink is absolute. That
 * symlink dangles once the build is packed into a serverless function and every
 * render dies with "Cannot find module 'jsdom-<hash>'". `sanitize-html` parses
 * with `htmlparser2` and needs no DOM, so nothing has to be externalised.
 *
 * Strict allowlist matching exactly what the rich-text editor can produce (see
 * `RichTextField`). Anything else — `<script>`, `<img>`, `onerror`, `style`,
 * `javascript:` URLs — is stripped. Void elements come back self-closing
 * (`<br />` where DOMPurify wrote `<br>`); same markup, and every sink renders
 * it identically.
 */
const RICH_TEXT_POLICY: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "h2", "h3", "ul", "ol", "li", "a"],
  allowedAttributes: { "*": ["href", "target", "rel"] },
  allowedSchemes: ["http", "https"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, RICH_TEXT_POLICY);
}
