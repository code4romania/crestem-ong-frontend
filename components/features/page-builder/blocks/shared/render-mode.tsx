"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Where a block is being rendered:
 *
 * - `public` — the site itself. The default, because the public pages render
 *   blocks with no provider above them, so only the builder has to say
 *   otherwise.
 * - `editor` — the builder canvas, one card per block.
 * - `preview` — the builder's full-screen preview.
 */
export type RenderMode = "public" | "editor" | "preview";

const RenderModeContext = createContext<RenderMode>("public");

/**
 * Tells blocks where they are. Only `custom-html` reads it, and for one
 * reason: pasted page code must not touch the admin's own document. Its
 * stylesheet is global and its scripts rewrite whatever they find (the
 * Legixplore navigation script reassigns every `href` on the page), so in the
 * canvas the block shows a summary card, and in the preview it renders inside
 * an isolated iframe.
 */
export function RenderModeProvider({
  value,
  children,
}: {
  value: RenderMode;
  children: ReactNode;
}) {
  return <RenderModeContext value={value}>{children}</RenderModeContext>;
}

export function useRenderMode(): RenderMode {
  return useContext(RenderModeContext);
}
