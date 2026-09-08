import { GraduationCap } from "lucide-react";
import { defineBlock } from "../../types";
import { ProgrammeGridEditor } from "./Editor";
import { ProgrammeGrid } from "./ProgrammeGrid";
import { programmeGridSchema, PROGRAMME_GRID_DEFAULTS } from "./schema";

export const programmeGridBlock = defineBlock({
  type: "programme-grid",
  category: "cards",
  name: "Programme Grid",
  description: "Afișare programe disponibile pe platformă",
  icon: GraduationCap,
  schema: programmeGridSchema,
  defaults: PROGRAMME_GRID_DEFAULTS,
  Editor: ProgrammeGridEditor,
  Renderer: ProgrammeGrid,
});
