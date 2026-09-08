import { Columns2 } from "lucide-react";
import { defineBlock } from "../../types";
import { ImageTextEditor } from "./Editor";
import { ImageText } from "./ImageText";
import { imageTextSchema, IMAGE_TEXT_DEFAULTS } from "./schema";

export const imageTextBlock = defineBlock({
  type: "image-text",
  category: "images",
  name: "Image + text",
  description: "Imagine lângă un bloc de text formatat",
  icon: Columns2,
  schema: imageTextSchema,
  defaults: IMAGE_TEXT_DEFAULTS,
  Editor: ImageTextEditor,
  Renderer: ImageText,
});
