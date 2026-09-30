import { createElement, type CSSProperties } from "react";
import type { IconScope } from "./legacy";
import { FALLBACK_ICON, hasIcon } from "./names";
import { getIconComponent, resolveIconName } from "./registry";

/**
 * Renders a stored icon value (`"lucide:<name>"` or a legacy key of `scope`).
 * Resolves the value itself rather than trusting parsed data: children of
 * Section / Columns blocks and the builder canvas render raw block JSON.
 * No hooks and no `"use client"`, so public pages get inline SVG and no JS.
 * Renders nothing for a cleared icon (`NO_ICON`).
 */
export function LucideIcon({
  value,
  scope,
  fallback,
  size = 24,
  className,
  style,
}: {
  value: unknown;
  scope: IconScope;
  /** Legacy key or stored value to use when `value` doesn't resolve. */
  fallback?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  if (!hasIcon(value)) return null;
  const name = resolveIconName(value, scope, fallback);
  const Icon = getIconComponent(name) ?? getIconComponent(FALLBACK_ICON)!;
  // `createElement`, not JSX: `Icon` is a static lucide component looked up by
  // name, which the compiler lint would misread as one created during render.
  return createElement(Icon, { size, className, style, "aria-hidden": true });
}
