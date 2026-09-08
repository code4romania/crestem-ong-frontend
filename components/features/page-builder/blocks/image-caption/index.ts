import { Images } from "lucide-react";
import { defineBlock } from "../../types";
import { ImageCaptionEditor } from "./Editor";
import { ImageCaption } from "./ImageCaption";
import { imageCaptionSchema, IMAGE_CAPTION_DEFAULTS } from "./schema";

export const imageCaptionBlock = defineBlock({
  type: "image-caption",
  category: "images",
  name: "Image with caption",
  description: "Imagine cu legendă, credit foto și sursă",
  icon: Images,
  schema: imageCaptionSchema,
  defaults: IMAGE_CAPTION_DEFAULTS,
  Editor: ImageCaptionEditor,
  Renderer: ImageCaption,
});
