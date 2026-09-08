import { FileText } from "lucide-react";
import { defineBlock } from "../../types";
import { RichTextEditor } from "./Editor";
import { RichText } from "./RichText";
import { richTextSchema, RICH_TEXT_DEFAULTS } from "./schema";

export const richTextBlock = defineBlock({
  type: "rich-text",
  category: "text",
  name: "Rich Text",
  description: "Editor de text bogat cu formatare completă",
  icon: FileText,
  schema: richTextSchema,
  defaults: RICH_TEXT_DEFAULTS,
  Editor: RichTextEditor,
  Renderer: RichText,
});
