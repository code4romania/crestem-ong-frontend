import { Image as ImageIcon } from "lucide-react";
import { defineBlock } from "../../types";
import { ImageEditor } from "./Editor";
import { Image } from "./Image";
import { imageSchema, IMAGE_DEFAULTS } from "./schema";

export const imageBlock = defineBlock({
  type: "image",
  category: "images",
  name: "Image",
  description: "Imagine independentă cu opțiuni de dimensionare și aliniere",
  icon: ImageIcon,
  schema: imageSchema,
  defaults: IMAGE_DEFAULTS,
  Editor: ImageEditor,
  Renderer: Image,
});
