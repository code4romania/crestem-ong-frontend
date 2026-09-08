import { LayoutGrid } from "lucide-react";
import { defineBlock } from "../../types";
import { CategoryGridEditor } from "./Editor";
import { CategoryGrid } from "./CategoryGrid";
import { categoryGridSchema, CATEGORY_GRID_DEFAULTS } from "./schema";

export const categoryGridBlock = defineBlock({
  type: "category-grid",
  category: "cards",
  name: "Category Grid",
  description: "Grilă de categorii cu iconițe",
  icon: LayoutGrid,
  schema: categoryGridSchema,
  defaults: CATEGORY_GRID_DEFAULTS,
  Editor: CategoryGridEditor,
  Renderer: CategoryGrid,
});
