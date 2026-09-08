/**
 * Typography for rendered rich-text HTML — the exact same tag styling is shared
 * by the editor's contenteditable surface and the public renderers, so what the
 * admin types matches what visitors see. Arbitrary-variant utilities so no
 * global stylesheet or `prose` plugin is needed; every class appears as a string
 * literal here so the Tailwind v4 scanner emits it.
 */
export const RICH_TEXT_PROSE = [
  "text-[15px] leading-relaxed text-[#475569]",
  "[&_p]:my-3 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
  "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2:first-child]:mt-0 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-[#162040]",
  "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3:first-child]:mt-0 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-bold [&_h3]:leading-snug [&_h3]:text-[#162040]",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_li]:my-1 [&_li]:marker:text-[#94a3b8]",
  "[&_strong]:font-semibold [&_strong]:text-[#162040]",
  "[&_a]:text-[#2563eb] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[#1d4ed8]",
].join(" ");

/**
 * Same layout as `RICH_TEXT_PROSE` but light-on-dark, for rich text rendered on
 * a dark surface (e.g. the navy Callout card).
 */
export const RICH_TEXT_PROSE_INVERSE = [
  "text-[15px] leading-relaxed text-white/75",
  "[&_p]:my-3 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
  "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2:first-child]:mt-0 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-white",
  "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3:first-child]:mt-0 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-bold [&_h3]:leading-snug [&_h3]:text-white",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_li]:my-1 [&_li]:marker:text-white/40",
  "[&_strong]:font-semibold [&_strong]:text-white",
  "[&_a]:text-[#7ff0c9] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-white",
].join(" ");
