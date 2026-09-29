"use client";

import { useEffect, useState } from "react";

type Registry = typeof import("./registry");

let loaded: Registry | null = null;
let pending: Promise<Registry> | null = null;

function loadRegistry(): Promise<Registry> {
  pending ??= import("./registry").then((mod) => (loaded = mod));
  return pending;
}

/**
 * lucide's full icon set for client components (picker, editor previews),
 * loaded as its own async chunk. A static import would land it in the chunk
 * Turbopack shares between the block editors and `next/link` — which every
 * public page downloads, because the block registry the public renderer
 * imports references each block's editor. `null` until loaded.
 */
export function useIconRegistry(): Registry | null {
  const [registry, setRegistry] = useState<Registry | null>(loaded);
  useEffect(() => {
    if (registry) return;
    let alive = true;
    loadRegistry().then((mod) => alive && setRegistry(mod));
    return () => {
      alive = false;
    };
  }, [registry]);
  return registry;
}
