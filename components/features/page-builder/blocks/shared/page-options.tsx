"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PageOption } from "@/lib/api/pages-types";

/** What a link field needs to know about the page it is being edited on. */
export interface PageOptionsValue {
  pages: PageOption[];
  /** The page being edited, so a link can offer to file its target underneath. */
  currentPageId: string | null;
  /** That page's path as it will be after saving, shown on the offer. */
  currentPath: string;
}

const EMPTY: PageOptionsValue = { pages: [], currentPageId: null, currentPath: "" };

const PageOptionsContext = createContext<PageOptionsValue>(EMPTY);

/**
 * The site's pages, offered to every CTA field in the builder. Block editors
 * receive only `value`/`onChange`/`errors`, so the list travels by context
 * rather than through each block's props.
 */
export function PageOptionsProvider({
  value,
  children,
}: {
  value: PageOptionsValue;
  children: ReactNode;
}) {
  return <PageOptionsContext value={value}>{children}</PageOptionsContext>;
}

export function usePageOptions(): PageOptionsValue {
  return useContext(PageOptionsContext);
}

/** The path a page-backed link resolves to, or null when the page is gone. */
export function pathForPage(pages: PageOption[], documentId: string): string | null {
  return pages.find((page) => page.documentId === documentId)?.cale ?? null;
}
