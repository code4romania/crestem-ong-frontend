import { Code2 } from "lucide-react";
import { defineBlock } from "../../types";
import { CustomHtmlEditor } from "./Editor";
import { CustomHtmlBlock } from "./CustomHtmlBlock";
import { customHtmlSchema, CUSTOM_HTML_DEFAULTS } from "./schema";

export const customHtmlBlock = defineBlock({
  type: "custom-html",
  category: "structure",
  name: "Cod HTML",
  description: "Secțiune lipită ca sursă: HTML, CSS și scripturi",
  icon: Code2,
  schema: customHtmlSchema,
  defaults: CUSTOM_HTML_DEFAULTS,
  Editor: CustomHtmlEditor,
  Renderer: CustomHtmlBlock,
});
