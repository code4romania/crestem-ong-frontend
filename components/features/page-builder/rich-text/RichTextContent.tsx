import type { CSSProperties } from "react";
import { hasRichText, toRichTextHtml } from "./has-rich-text";
import { RICH_TEXT_PROSE_INHERIT } from "./prose";

/**
 * Renders a rich-text field in a slot that styles its own text. Pure (no
 * `"use client"`) so block renderers stay server-renderable. The HTML arrives
 * sanitised by `sanitizeBlocks` on the way to the backend; values still stored
 * as plain text are escaped by `toRichTextHtml`. Renders nothing when empty.
 */
export function RichTextContent({
  html,
  as: Tag = "div",
  className = "",
  style,
  role,
  "aria-level": ariaLevel,
}: {
  html: string;
  /** `blockquote` for quotes and testimonials. */
  as?: "div" | "blockquote";
  className?: string;
  style?: CSSProperties;
  role?: string;
  "aria-level"?: number;
}) {
  if (!hasRichText(html)) return null;
  return (
    <Tag
      role={role}
      aria-level={ariaLevel}
      className={`${RICH_TEXT_PROSE_INHERIT} ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: toRichTextHtml(html) }}
    />
  );
}
