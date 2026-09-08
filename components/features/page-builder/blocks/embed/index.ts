import { AppWindow } from "lucide-react";
import { defineBlock } from "../../types";
import { EmbedEditor } from "./Editor";
import { Embed } from "./Embed";
import { embedSchema, EMBED_DEFAULTS } from "./schema";

export const embedBlock = defineBlock({
  type: "embed",
  category: "media",
  name: "Embed",
  description:
    "Încorporează o pagină externă (hartă, formular, calendar) într-un iframe",
  icon: AppWindow,
  schema: embedSchema,
  defaults: EMBED_DEFAULTS,
  Editor: EmbedEditor,
  Renderer: Embed,
});
