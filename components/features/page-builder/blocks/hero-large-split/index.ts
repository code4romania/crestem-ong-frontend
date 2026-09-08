import { LayoutTemplate } from "lucide-react";
import { defineBlock } from "../../types";
import { HeroLargeSplitEditor } from "./Editor";
import { HeroLargeSplit } from "./HeroLargeSplit";
import { heroLargeSplitSchema, HERO_LARGE_SPLIT_DEFAULTS } from "./schema";

export const heroLargeSplitBlock = defineBlock({
  type: "hero-large-split",
  category: "hero",
  name: "Hero – Large Split",
  description: "Imagine mare + text alăturat, CTA proeminent",
  icon: LayoutTemplate,
  fullBleed: true,
  schema: heroLargeSplitSchema,
  defaults: HERO_LARGE_SPLIT_DEFAULTS,
  Editor: HeroLargeSplitEditor,
  Renderer: HeroLargeSplit,
});
