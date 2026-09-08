import { HelpCircle } from "lucide-react";
import { defineBlock } from "../../types";
import { FaqCollectionEditor } from "./Editor";
import { FaqCollection } from "./FaqCollection";
import { faqCollectionSchema, FAQ_COLLECTION_DEFAULTS } from "./schema";

export const faqCollectionBlock = defineBlock({
  type: "faq-collection",
  category: "dynamic",
  name: "FAQ Collection",
  description: "Acordeon cu întrebări frecvente și răspunsuri",
  icon: HelpCircle,
  schema: faqCollectionSchema,
  defaults: FAQ_COLLECTION_DEFAULTS,
  Editor: FaqCollectionEditor,
  Renderer: FaqCollection,
});
