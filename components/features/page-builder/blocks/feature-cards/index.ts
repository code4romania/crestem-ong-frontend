import { LayoutGrid } from "lucide-react";
import { defineBlock } from "../../types";
import { FeatureCardsEditor } from "./Editor";
import { FeatureCards } from "./FeatureCards";
import { featureCardsSchema, FEATURE_CARDS_DEFAULTS } from "./schema";

export const featureCardsBlock = defineBlock({
  type: "feature-cards",
  category: "cards",
  name: "Feature Cards",
  description: "Carduri cu iconițe și descrieri de funcționalități",
  icon: LayoutGrid,
  schema: featureCardsSchema,
  defaults: FEATURE_CARDS_DEFAULTS,
  Editor: FeatureCardsEditor,
  Renderer: FeatureCards,
});
