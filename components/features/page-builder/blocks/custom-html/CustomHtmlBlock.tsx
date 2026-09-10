"use client";

import { useMemo } from "react";
import { useRenderMode } from "../shared/render-mode";
import { CustomHtmlContent } from "./CustomHtml";
import { CustomHtmlPlaceholder } from "./CustomHtmlPlaceholder";
import { CustomHtmlPreview } from "./CustomHtmlPreview";
import { splitHtmlSource } from "./split";
import type { CustomHtmlData } from "./schema";

/**
 * Picks what the block shows, per render mode: the real section on the site, an
 * isolated iframe in the builder's preview, a summary card on the canvas. The
 * single place that decision is made — `CustomHtmlContent` and its scripts are
 * never rendered into the admin's own document.
 *
 * The stored source is one string; splitting it into markup / stylesheet /
 * scripts happens here, memoised so a re-render does not re-scan a section that
 * can run to hundreds of kilobytes.
 *
 * A client component (it reads the render mode from context), but the markup it
 * renders is still produced on the server, so the section stays crawlable.
 */
export function CustomHtmlBlock({ data }: { data: CustomHtmlData }) {
  const parti = useMemo(() => splitHtmlSource(data.sursa), [data.sursa]);
  const mode = useRenderMode();

  if (mode === "editor") {
    return <CustomHtmlPlaceholder data={data} parti={parti} />;
  }

  const gol = !parti.html.trim() && parti.scripturi.length === 0;

  if (mode === "preview") {
    return gol ? null : <CustomHtmlPreview parti={parti} latime={data.latime} />;
  }

  if (gol) return null;

  return <CustomHtmlContent parti={parti} latime={data.latime} />;
}
