import { LEGACY_ICONS, type IconScope } from "./legacy";
import { ICON_PREFIX, isWellFormedName } from "./names";

/**
 * Reads a stored icon value as a bare lucide name, without checking that
 * lucide has it (see `registry.resolveIconName` for that). `"lucide:<name>"`
 * is a lucide name; anything unprefixed is a legacy key of `scope`'s old
 * palette. Returns `undefined` for anything else.
 */
export function parseIconValue(
  value: unknown,
  scope: IconScope,
): string | undefined {
  if (typeof value !== "string") return undefined;
  if (value.startsWith(ICON_PREFIX)) {
    const name = value.slice(ICON_PREFIX.length);
    return isWellFormedName(name) ? name : undefined;
  }
  return LEGACY_ICONS[scope][value];
}
