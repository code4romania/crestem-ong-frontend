"use client";

import {
  badgeTone,
  extLabel,
} from "@/components/features/page-builder/blocks/documents/helpers";

/**
 * The coloured extension chip (PDF / XLSX / DOCX …) used for non-media assets,
 * matching the Documents block's file rows. Falls back to a neutral "FIȘIER"
 * when the extension can't be read.
 */
export function FileTypeBadge({
  ext,
  url,
  size = "md",
}: {
  ext: string | null;
  url: string;
  size?: "sm" | "md";
}) {
  const label = extLabel(ext ?? "", url) || "FIȘIER";
  const dims = size === "sm" ? "h-8 w-11 text-[10px]" : "h-11 w-14 text-xs";
  return (
    <span
      aria-hidden="true"
      className={`flex ${dims} items-center justify-center rounded-md font-bold text-white ${badgeTone(label)}`}
    >
      {label}
    </span>
  );
}
