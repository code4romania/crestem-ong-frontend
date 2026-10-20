let cached: Promise<Record<string, string[]>> | null = null;

/**
 * lucide's search tags (name → English keywords), from `lucide-static` pinned
 * to the same version as lucide-react. Its keys are also the complete list of
 * icon names, so the picker uses it as its catalogue. Loaded on demand — only
 * the picker needs it, never a rendered page. `./registry` is imported
 * dynamically for the same reason (see `use-icon-registry.ts`).
 */
export function loadIconTags(): Promise<Record<string, string[]>> {
  cached ??= Promise.all([import("lucide-static/tags.json"), import("./registry")])
    .then(([mod, { isIconName }]) => {
      const all = (mod.default ?? mod) as Record<string, string[]>;
      return Object.fromEntries(
        Object.entries(all).filter(([name]) => isIconName(name)),
      );
    })
    .catch((error) => {
      cached = null;
      throw error;
    });
  return cached;
}
