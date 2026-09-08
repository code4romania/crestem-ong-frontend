/**
 * Presentation helpers shared by the Documents editor and renderer. Kept
 * framework-free so the pure renderer can import them unchanged.
 */

/** File-extension label (no dot, upper-case) from a stored `ext` or a URL. */
export function extLabel(ext: string, url: string): string {
  const fromUrl = url.split(/[?#]/)[0].split(".").pop() ?? "";
  const raw = ext || (fromUrl.length <= 5 ? fromUrl : "");
  return raw.replace(/^\./, "").toUpperCase().slice(0, 5);
}

/** Strapi reports size in KB. Show KB under 1 MB, otherwise MB with one decimal. */
export function formatSize(sizeKb: number | null): string | null {
  if (sizeKb == null) return null;
  if (sizeKb < 1024) return `${Math.round(sizeKb)} KB`;
  return `${(sizeKb / 1024).toFixed(1)} MB`;
}

const BADGE_TONE: Record<string, string> = {
  PDF: "bg-[#ef4444]",
  DOC: "bg-[#2563eb]",
  DOCX: "bg-[#2563eb]",
  XLS: "bg-[#16a34a]",
  XLSX: "bg-[#16a34a]",
  CSV: "bg-[#16a34a]",
  PPT: "bg-[#ea580c]",
  PPTX: "bg-[#ea580c]",
  TXT: "bg-[#64748b]",
};

/** Tailwind background class for the extension badge; slate for anything else. */
export function badgeTone(label: string): string {
  return BADGE_TONE[label] ?? "bg-[#64748b]";
}
