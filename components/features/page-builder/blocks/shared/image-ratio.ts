/**
 * "Raport imagine" for blocks that show images in a grid of cards/tiles — same
 * choices as the Image block. "original" shows the whole image at its natural
 * height (no crop); the ratios crop it to fill (`object-cover`). The setting is
 * per block so every card in a row keeps the same image height.
 *
 * Blocks saved before the option existed have no `raport` in their stored JSON,
 * and the builder preview/editor read that JSON unparsed — so callers pass the
 * block's default as a fallback rather than trusting the schema default.
 */
export const IMAGE_RATIOS = ["original", "16:9", "4:3", "1:1"] as const;

export type ImageRatio = (typeof IMAGE_RATIOS)[number];

const RATIO_CLASS: Record<ImageRatio, string> = {
  original: "h-auto",
  "16:9": "aspect-video object-cover",
  "4:3": "aspect-[4/3] object-cover",
  "1:1": "aspect-square object-cover",
};

/** Sizing classes for a full-width `<img>` at the chosen ratio. */
export function imageRatioClass(raport: ImageRatio): string {
  return RATIO_CLASS[raport];
}

export const IMAGE_RATIO_OPTIONS: { value: ImageRatio; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
  { value: "1:1", label: "1:1" },
];

/**
 * For blocks whose pre-existing look was a fixed-height crop rather than one of
 * the ratios: "implicit" keeps that crop, so saved pages don't change until an
 * admin picks something else. The block maps "implicit" to its own classes.
 */
export const IMAGE_RATIOS_WITH_IMPLICIT = ["implicit", ...IMAGE_RATIOS] as const;

export type ImageRatioWithImplicit = (typeof IMAGE_RATIOS_WITH_IMPLICIT)[number];

export const IMAGE_RATIO_OPTIONS_WITH_IMPLICIT: {
  value: ImageRatioWithImplicit;
  label: string;
}[] = [{ value: "implicit", label: "Implicit" }, ...IMAGE_RATIO_OPTIONS];
