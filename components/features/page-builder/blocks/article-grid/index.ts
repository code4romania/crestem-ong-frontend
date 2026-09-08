import { Newspaper } from "lucide-react";
import { defineBlock } from "../../types";
import { ArticleGridEditor } from "./Editor";
import { ArticleGrid } from "./ArticleGrid";
import { articleGridSchema, ARTICLE_GRID_DEFAULTS } from "./schema";

export const articleGridBlock = defineBlock({
  type: "article-grid",
  category: "cards",
  name: "Article Grid",
  description: "Grilă de articole din bibliotecă",
  icon: Newspaper,
  schema: articleGridSchema,
  defaults: ARTICLE_GRID_DEFAULTS,
  Editor: ArticleGridEditor,
  Renderer: ArticleGrid,
});
