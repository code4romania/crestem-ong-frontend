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

/**
 * Whether a stored value is editor HTML rather than legacy plain text. Fields
 * that used to be `<textarea>`s still hold plain strings until they are next
 * saved, and the editor always emits a leading block tag.
 */
function isRichTextHtml(value: string): boolean {
  return /^\s*<(p|h2|h3|ul|ol)[\s>]/i.test(value);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Editor HTML passes through; legacy plain text is escaped and turned into
 * paragraphs — a blank line splits paragraphs, a single newline becomes `<br>`,
 * matching how the old `whitespace-pre-line` rendering read.
 */
export function toRichTextHtml(value: string): string {
  if (!value.trim() || isRichTextHtml(value)) return value;
  return value
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim()).replace(/\n/g, "<br />")}</p>`)
    .join("");
}
