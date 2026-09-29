/**
 * Icons are identified by lucide's canonical kebab-case name (`book-open`),
 * the same name lucide.dev shows. Newly picked icons are stored with this
 * prefix so they can never be mistaken for a block's legacy short key — five
 * of those (`book`, `check`, `file`, `building`, `calendar`) are also real
 * lucide names for a different glyph. See `resolve.ts`.
 *
 * Pure string helpers only: block schemas import this, and client components
 * on public pages import block schemas, so nothing here may pull in lucide's
 * full icon set (that lives in `registry.ts`).
 */
export const ICON_PREFIX = "lucide:";

/** Rendered when a stored value can't be resolved to any icon. */
export const FALLBACK_ICON = "circle-question-mark";

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Shape check only — whether lucide actually has it is `registry.isIconName`. */
export function isWellFormedName(name: string): boolean {
  return name.length <= 64 && KEBAB.test(name);
}

/** `arrow-down-0-1` → `ArrowDown01`, lucide-react's export name. */
export function toPascal(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function toStored(name: string): string {
  return `${ICON_PREFIX}${name}`;
}
