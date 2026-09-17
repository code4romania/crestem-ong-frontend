/**
 * DOM-free rich-text helpers, kept apart from `sanitize.server.ts` so client
 * components can import them without pulling in `isomorphic-dompurify` — and
 * with it `jsdom`, which Turbopack externalises through an absolute symlink in
 * `.next/node_modules` that does not survive a serverless deploy. Anything in
 * a client component's module graph has to stay on this side of the line.
 */

/** Strip tags + entities down to plain text, e.g. for a compact list preview. */
export function richTextToPlainText(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

/** Whether the HTML carries any real text once tags are stripped. */
export function hasRichText(html: string): boolean {
  return richTextToPlainText(html).length > 0;
}
