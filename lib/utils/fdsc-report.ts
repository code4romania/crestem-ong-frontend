// lib/utils/fdsc-report.ts
const FILE_TYPE_STYLES: Record<string, { label: string; background: string; color: string }> = {
  ".pdf": { label: "PDF", background: "#fef2f2", color: "#b91c1c" },
  ".doc": { label: "DOC", background: "#dcfafb", color: "#5656e5" },
  ".docx": { label: "DOC", background: "#dcfafb", color: "#5656e5" },
  ".xls": { label: "XLS", background: "#f0fdf4", color: "#15803d" },
  ".xlsx": { label: "XLS", background: "#f0fdf4", color: "#15803d" },
};

export function fileTypeBadge(ext: string | undefined) {
  const key = ext?.toLowerCase() ?? "";
  const fallbackLabel = key.replace(/^\./, "").slice(0, 4).toUpperCase() || "?";
  return FILE_TYPE_STYLES[key] ?? { label: fallbackLabel, background: "#f1f5f9", color: "#5b6779" };
}
