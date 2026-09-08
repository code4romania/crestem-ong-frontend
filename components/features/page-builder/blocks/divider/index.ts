import { Minus } from "lucide-react";
import { defineBlock } from "../../types";
import { DividerEditor } from "./Editor";
import { DividerBlock } from "./DividerBlock";
import { dividerSchema, DIVIDER_DEFAULTS } from "./schema";

export const dividerBlock = defineBlock({
  type: "divider",
  category: "structure",
  name: "Divider",
  description: "Linie separatoare cu stil personalizabil",
  icon: Minus,
  bare: true,
  schema: dividerSchema,
  defaults: DIVIDER_DEFAULTS,
  Editor: DividerEditor,
  Renderer: DividerBlock,
});
