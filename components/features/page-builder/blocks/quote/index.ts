import { Quote as QuoteIcon } from "lucide-react";
import { defineBlock } from "../../types";
import { QuoteEditor } from "./Editor";
import { Quote } from "./Quote";
import { quoteSchema, QUOTE_DEFAULTS } from "./schema";

export const quoteBlock = defineBlock({
  type: "quote",
  category: "text",
  name: "Citat",
  description: "Citat evidențiat cu autor și sursă",
  icon: QuoteIcon,
  schema: quoteSchema,
  defaults: QUOTE_DEFAULTS,
  Editor: QuoteEditor,
  Renderer: Quote,
});
