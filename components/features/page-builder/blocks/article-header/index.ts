import { Heading } from "lucide-react";
import { defineBlock } from "../../types";
import { ArticleHeaderEditor } from "./Editor";
import { ArticleHeader } from "./ArticleHeader";
import { articleHeaderSchema, ARTICLE_HEADER_DEFAULTS } from "./schema";

export const articleHeaderBlock = defineBlock({
  type: "article-header",
  category: "hero",
  name: "Articol Header",
  description: "Antetul unui articol din bibliotecă",
  icon: Heading,
  fullBleed: true,
  schema: articleHeaderSchema,
  defaults: ARTICLE_HEADER_DEFAULTS,
  Editor: ArticleHeaderEditor,
  Renderer: ArticleHeader,
});
