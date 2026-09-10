/** One `<script>` from a pasted source: either inline code, or an external URL. */
export type ScriptSursa = { cod: string } | { src: string };

export interface SurseHtml {
  html: string;
  css: string;
  scripturi: ScriptSursa[];
}

/** `<style>` and `<script>` blocks, matched with their own closing tag. */
const BLOCK_TAG = /<(style|script)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi;
const SVG_BLOCK = /<svg\b[^>]*>[\s\S]*?<\/svg\s*>/gi;
const SRC_ATTR = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;

type Interval = [start: number, end: number];

function svgIntervals(sursa: string): Interval[] {
  const intervals: Interval[] = [];
  for (const match of sursa.matchAll(SVG_BLOCK)) {
    const start = match.index ?? 0;
    intervals.push([start, start + match[0].length]);
  }
  return intervals;
}

function insideAny(index: number, intervals: Interval[]): boolean {
  return intervals.some(([start, end]) => index >= start && index < end);
}

/**
 * Splits a pasted block of page source into the three parts the block stores
 * separately: markup, stylesheet, and scripts in the order they appeared.
 *
 * They are stored apart because they are injected apart — markup is rendered on
 * the server, the stylesheet goes into a `<style>` next to it, and scripts have
 * to be executed by the client after mount (markup set through
 * `dangerouslySetInnerHTML` never runs its own scripts).
 *
 * Tags inside an inline `<svg>` are left where they are: the site's logos carry
 * their fills in a `<defs><style>`, and several reuse the same class name with
 * a different colour, so hoisting them would let one logo repaint the others.
 */
export function splitHtmlSource(sursa: string): SurseHtml {
  // The builder previews stored data without parsing it first, so a block
  // saved under an older shape can arrive with no source at all.
  if (typeof sursa !== "string") return { html: "", css: "", scripturi: [] };

  const svgs = svgIntervals(sursa);
  const css: string[] = [];
  const scripturi: ScriptSursa[] = [];

  let html = "";
  let copiedTo = 0;

  for (const match of sursa.matchAll(BLOCK_TAG)) {
    const start = match.index ?? 0;
    if (insideAny(start, svgs)) continue;

    html += sursa.slice(copiedTo, start);
    copiedTo = start + match[0].length;

    const [, tag, attrs, contents] = match;

    if (tag.toLowerCase() === "style") {
      const text = contents.trim();
      if (text) css.push(text);
      continue;
    }

    const src = SRC_ATTR.exec(attrs ?? "");
    if (src) {
      const url = (src[1] ?? src[2] ?? src[3] ?? "").trim();
      if (url) scripturi.push({ src: url });
      continue;
    }

    const cod = contents.trim();
    if (cod) scripturi.push({ cod });
  }

  html += sursa.slice(copiedTo);

  return { html: html.trim(), css: css.join("\n\n"), scripturi };
}
