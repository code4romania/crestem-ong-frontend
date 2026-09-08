import { GalleryThumbnails } from "lucide-react";
import { defineBlock } from "../../types";
import { GalleryEditor } from "./Editor";
import { Gallery } from "./Gallery";
import { gallerySchema, GALLERY_DEFAULTS } from "./schema";

export const galleryBlock = defineBlock({
  type: "gallery",
  category: "images",
  name: "Gallery",
  description: "Galerie foto cu lightbox interactiv",
  icon: GalleryThumbnails,
  schema: gallerySchema,
  defaults: GALLERY_DEFAULTS,
  Editor: GalleryEditor,
  Renderer: Gallery,
});
