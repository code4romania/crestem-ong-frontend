import { z } from "zod";
import type { IconScope } from "./legacy";
import { parseIconValue } from "./resolve";
import { NO_ICON, toStored } from "./names";

/**
 * Block-schema field for an icon. Accepts anything — legacy keys, stored
 * values, junk — and always outputs `"lucide:<name>"`, so an old or hand-edited
 * block still parses instead of being dropped. `defaultKey` is the block's
 * former default, in its legacy form. `NO_ICON` (cleared in the editor) is
 * kept as is. Checks shape only: a well-formed name
 * lucide doesn't have is caught at render, where `LucideIcon` falls back.
 */
export function iconSchema(scope: IconScope, defaultKey: string) {
  // `.optional()` so a block saved without the key still parses (zod 4 makes a
  // bare transformed `unknown()` key required).
  return z
    .unknown()
    .optional()
    .transform((value) =>
      value === NO_ICON
        ? NO_ICON
        : toStored(
            parseIconValue(value, scope) ?? parseIconValue(defaultKey, scope)!,
          ),
    );
}
