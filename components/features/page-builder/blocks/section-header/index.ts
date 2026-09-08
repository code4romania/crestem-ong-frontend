import { Heading } from "lucide-react";
import { defineBlock } from "../../types";
import { SectionHeaderEditor } from "./Editor";
import { SectionHeader } from "./SectionHeader";
import { sectionHeaderSchema, SECTION_HEADER_DEFAULTS } from "./schema";

export const sectionHeaderBlock = defineBlock({
  type: "section-header",
  category: "structure",
  name: "Section Header",
  description: "Titlu de secțiune cu subtitlu opțional",
  icon: Heading,
  schema: sectionHeaderSchema,
  defaults: SECTION_HEADER_DEFAULTS,
  Editor: SectionHeaderEditor,
  Renderer: SectionHeader,
});
