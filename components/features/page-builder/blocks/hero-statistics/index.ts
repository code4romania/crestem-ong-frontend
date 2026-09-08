import { BarChart3 } from "lucide-react";
import { defineBlock } from "../../types";
import { HeroStatisticsEditor } from "./Editor";
import { HeroStatistics } from "./HeroStatistics";
import { heroStatisticsSchema, HERO_STATISTICS_DEFAULTS } from "./schema";

export const heroStatisticsBlock = defineBlock({
  type: "hero-statistics",
  category: "hero",
  name: "Hero – Statistics",
  description: "Hero cu contoare/statistici integrate",
  icon: BarChart3,
  fullBleed: true,
  schema: heroStatisticsSchema,
  defaults: HERO_STATISTICS_DEFAULTS,
  Editor: HeroStatisticsEditor,
  Renderer: HeroStatistics,
});
