import { icons, type LucideIcon } from "lucide-react";
import type { IconScope } from "./legacy";
import { FALLBACK_ICON, isWellFormedName, toPascal } from "./names";
import { parseIconValue } from "./resolve";

/**
 * Everything that needs lucide's full icon set (~180 KB gz). Only rendering
 * (`LucideIcon`, server-side on public pages) and the admin picker import
 * this — never block schemas, which public client components pull in.
 */
export function getIconComponent(name: string): LucideIcon | undefined {
  if (!isWellFormedName(name)) return undefined;
  return (icons as Record<string, LucideIcon>)[toPascal(name)];
}

export function isIconName(name: string): boolean {
  return getIconComponent(name) !== undefined;
}

/**
 * Turns a stored icon value into the name of an icon lucide actually has.
 * `fallback` (a stored value or legacy key) covers values that don't
 * resolve, then `FALLBACK_ICON` — never throws.
 */
export function resolveIconName(
  value: unknown,
  scope: IconScope,
  fallback?: string,
): string {
  for (const candidate of [value, fallback]) {
    const name = parseIconValue(candidate, scope);
    if (name && isIconName(name)) return name;
  }
  return FALLBACK_ICON;
}
