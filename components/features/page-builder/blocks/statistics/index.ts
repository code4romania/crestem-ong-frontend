import { TrendingUp } from "lucide-react";
import { defineBlock } from "../../types";
import { StatisticsEditor } from "./Editor";
import { Statistics } from "./Statistics";
import { statisticsSchema, STATISTICS_DEFAULTS } from "./schema";

export const statisticsBlock = defineBlock({
  type: "statistics",
  category: "structure",
  name: "Statistics",
  description: "Contoare cu etichete",
  icon: TrendingUp,
  schema: statisticsSchema,
  defaults: STATISTICS_DEFAULTS,
  Editor: StatisticsEditor,
  Renderer: Statistics,
});
