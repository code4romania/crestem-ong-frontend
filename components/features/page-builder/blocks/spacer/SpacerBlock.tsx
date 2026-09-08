import type { SpacerData } from "./schema";

/**
 * Full literal classes so the Tailwind scanner picks them up. Each value shrinks
 * below `md` — the editor promises "valorile se reduc automat pe ecrane mici".
 */
const HEIGHT_CLASS: Record<SpacerData["dimensiune"], string> = {
  mic: "h-6 md:h-10",
  mediu: "h-10 md:h-20",
  mare: "h-16 md:h-32",
  "foarte-mare": "h-24 md:h-48",
};

/**
 * "Structure – Spacer" — a vertical gap between blocks, smaller on narrow
 * viewports. Pure (no hooks, no `"use client"`) so it renders on the public page
 * unchanged once a backend feeds it the same data shape.
 */
export function SpacerBlock({ data }: { data: SpacerData }) {
  return <div aria-hidden="true" className={HEIGHT_CLASS[data.dimensiune]} />;
}
