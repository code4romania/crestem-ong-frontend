import { LibraryBig } from "lucide-react";
import { defineBlock } from "../../types";
import { BibliotecaCategoriiEditor } from "./Editor";
import { BibliotecaCategorii } from "./BibliotecaCategorii";
import { bibliotecaCategoriiSchema, BIBLIOTECA_CATEGORII_DEFAULTS } from "./schema";

export const bibliotecaCategoriiBlock = defineBlock({
  /**
   * Deliberately still `article-grid`, though the block now lists categories.
   * The type is the discriminator PERSISTED inside every saved page's `blocuri`,
   * so renaming it invalidates content already in the database — a save of such
   * a page is rejected outright with "Tip de bloc necunoscut". The old block's
   * stored fields are simply dropped on parse, since the schema below is a
   * non-strict object, and `titlu` and `coloane` carry over unchanged.
   */
  type: "article-grid",
  category: "cards",
  name: "Categorii Bibliotecă",
  description: "Cardurile categoriilor din bibliotecă",
  schema: bibliotecaCategoriiSchema,
  defaults: BIBLIOTECA_CATEGORII_DEFAULTS,
  icon: LibraryBig,
  Editor: BibliotecaCategoriiEditor,
  Renderer: BibliotecaCategorii,
});
