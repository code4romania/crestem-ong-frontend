import type { BlockCategory, BlockDefinition } from "./types";
import { heroLargeSplitBlock } from "./blocks/hero-large-split";
import { heroCenteredBlock } from "./blocks/hero-centered";
import { heroIntroBlock } from "./blocks/hero-intro";
import { heroStatisticsBlock } from "./blocks/hero-statistics";
import { featureCardsBlock } from "./blocks/feature-cards";
import { partnersBlock } from "./blocks/partners";
import { articleGridBlock } from "./blocks/article-grid";
import { programmeGridBlock } from "./blocks/programme-grid";
import { peopleGridBlock } from "./blocks/people-grid";
import { categoryGridBlock } from "./blocks/category-grid";
import { peopleCollectionBlock } from "./blocks/people-collection";
import { testimonialsBlock } from "./blocks/testimonials";
import { faqCollectionBlock } from "./blocks/faq-collection";
import { richTextBlock } from "./blocks/rich-text";
import { calloutBlock } from "./blocks/callout";
import { quoteBlock } from "./blocks/quote";
import { videoBlock } from "./blocks/video";
import { documentsBlock } from "./blocks/documents";
import { embedBlock } from "./blocks/embed";
import { imageBlock } from "./blocks/image";
import { imageCaptionBlock } from "./blocks/image-caption";
import { imageTextBlock } from "./blocks/image-text";
import { galleryBlock } from "./blocks/gallery";
import { columnsBlock } from "./blocks/columns";
import { sectionBlock } from "./blocks/section";
import { sectionHeaderBlock } from "./blocks/section-header";
import { timelineBlock } from "./blocks/timeline";
import { numberedProcessBlock } from "./blocks/numbered-process";
import { statisticsBlock } from "./blocks/statistics";
import { spacerBlock } from "./blocks/spacer";
import { dividerBlock } from "./blocks/divider";

/**
 * Every working block, keyed by `type`. Adding another is a new folder under
 * `blocks/` plus one line here.
 */
export const BLOCK_REGISTRY: Record<string, BlockDefinition> = {
  [heroLargeSplitBlock.type]: heroLargeSplitBlock,
  [heroCenteredBlock.type]: heroCenteredBlock,
  [heroIntroBlock.type]: heroIntroBlock,
  [heroStatisticsBlock.type]: heroStatisticsBlock,
  [featureCardsBlock.type]: featureCardsBlock,
  [partnersBlock.type]: partnersBlock,
  [articleGridBlock.type]: articleGridBlock,
  [programmeGridBlock.type]: programmeGridBlock,
  [peopleGridBlock.type]: peopleGridBlock,
  [categoryGridBlock.type]: categoryGridBlock,
  [peopleCollectionBlock.type]: peopleCollectionBlock,
  [testimonialsBlock.type]: testimonialsBlock,
  [faqCollectionBlock.type]: faqCollectionBlock,
  [richTextBlock.type]: richTextBlock,
  [calloutBlock.type]: calloutBlock,
  [quoteBlock.type]: quoteBlock,
  [videoBlock.type]: videoBlock,
  [documentsBlock.type]: documentsBlock,
  [embedBlock.type]: embedBlock,
  [imageBlock.type]: imageBlock,
  [imageCaptionBlock.type]: imageCaptionBlock,
  [imageTextBlock.type]: imageTextBlock,
  [galleryBlock.type]: galleryBlock,
  [columnsBlock.type]: columnsBlock,
  [sectionBlock.type]: sectionBlock,
  [sectionHeaderBlock.type]: sectionHeaderBlock,
  [timelineBlock.type]: timelineBlock,
  [numberedProcessBlock.type]: numberedProcessBlock,
  [statisticsBlock.type]: statisticsBlock,
  [spacerBlock.type]: spacerBlock,
  [dividerBlock.type]: dividerBlock,
};

export const CATEGORY_ORDER: BlockCategory[] = [
  "hero",
  "text",
  "images",
  "media",
  "cards",
  "dynamic",
  "structure",
];

export const CATEGORY_LABELS: Record<BlockCategory, string> = {
  hero: "Hero",
  text: "Text",
  images: "Images",
  media: "Media",
  cards: "Cards",
  dynamic: "Dynamic",
  structure: "Structure",
};

export const CATEGORY_DOT: Record<BlockCategory, string> = {
  hero: "#3b82f6",
  text: "#22c55e",
  images: "#a855f7",
  media: "#f97316",
  cards: "#eab308",
  dynamic: "#ec4899",
  structure: "#94a3b8",
};

/** Icon-chip fill/foreground per category, matching the sidebar dot hue. */
export const CATEGORY_ICON: Record<BlockCategory, { bg: string; fg: string }> = {
  hero: { bg: "#eff6ff", fg: "#2563eb" },
  text: { bg: "#f0fdf4", fg: "#16a34a" },
  images: { bg: "#faf5ff", fg: "#9333ea" },
  media: { bg: "#fff7ed", fg: "#ea580c" },
  cards: { bg: "#fefce8", fg: "#ca8a04" },
  dynamic: { bg: "#fdf2f8", fg: "#db2777" },
  structure: { bg: "#f8fafc", fg: "#64748b" },
};

/**
 * Blocks shown in the picker but not yet implemented — they render as disabled
 * cards ("în curând"). Copy matches the Figma design.
 */
export interface UpcomingBlock {
  name: string;
  description: string;
  category: BlockCategory;
}

export const UPCOMING_BLOCKS: UpcomingBlock[] = [];
