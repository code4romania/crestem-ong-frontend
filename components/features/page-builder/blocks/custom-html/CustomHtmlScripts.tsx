"use client";

import { useEffect, useRef } from "react";
import { runScripts } from "./inject";
import type { ScriptSursa } from "./split";

/**
 * Runs the block's scripts once mounted, and removes what they registered when
 * the block goes away. Rendered only on the public page — `CustomHtmlBlock`
 * keeps it out of the builder entirely.
 *
 * The scripts are keyed by their serialised form rather than by array
 * identity: the renderer re-parses its data on every render, so depending on
 * the array itself would re-execute the page's code on any parent re-render.
 */
export function CustomHtmlScripts({ scripturi }: { scripturi: ScriptSursa[] }) {
  const anchor = useRef<HTMLDivElement>(null);
  const key = JSON.stringify(scripturi);

  useEffect(() => {
    const host = anchor.current;
    if (!host) return;

    const lista = JSON.parse(key) as ScriptSursa[];
    if (lista.length === 0) return;

    return runScripts(host, lista);
  }, [key]);

  return <div ref={anchor} hidden />;
}
