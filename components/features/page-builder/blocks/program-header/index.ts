import { Rocket } from "lucide-react";
import { defineBlock } from "../../types";
import { ProgramHeaderEditor } from "./Editor";
import { ProgramHeader } from "./ProgramHeader";
import { programHeaderSchema, PROGRAM_HEADER_DEFAULTS } from "./schema";

export const programHeaderBlock = defineBlock({
  type: "program-header",
  category: "hero",
  name: "Program Header",
  description: "Antet de program cu susținători și bara de statistici",
  icon: Rocket,
  fullBleed: true,
  schema: programHeaderSchema,
  defaults: PROGRAM_HEADER_DEFAULTS,
  Editor: ProgramHeaderEditor,
  Renderer: ProgramHeader,
});
