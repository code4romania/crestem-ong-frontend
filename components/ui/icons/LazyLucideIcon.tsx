"use client";

import { createElement, type CSSProperties } from "react";
import type { IconScope } from "./legacy";
import { FALLBACK_ICON } from "./names";
import { useIconRegistry } from "./use-icon-registry";

/**
 * `LucideIcon` for client components (editor list previews, admin screens).
 * Same props and output, but the icon set is loaded on demand — see
 * `use-icon-registry.ts`. Renders an empty box of the same size until then.
 * Server components should keep using `LucideIcon`.
 */
export function LazyLucideIcon({
  value,
  scope,
  fallback,
  size = 24,
  className,
  style,
}: {
  value: unknown;
  scope: IconScope;
  fallback?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const registry = useIconRegistry();
  if (!registry) {
    return (
      <span
        aria-hidden
        className={`inline-block ${className ?? ""}`}
        style={{ width: size, height: size, ...style }}
      />
    );
  }
  const name = registry.resolveIconName(value, scope, fallback);
  const Icon =
    registry.getIconComponent(name) ?? registry.getIconComponent(FALLBACK_ICON)!;
  return createElement(Icon, { size, className, style, "aria-hidden": true });
}
