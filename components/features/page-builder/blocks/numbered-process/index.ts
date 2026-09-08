import { ListOrdered } from "lucide-react";
import { defineBlock } from "../../types";
import { NumberedProcessEditor } from "./Editor";
import { NumberedProcess } from "./NumberedProcess";
import {
  numberedProcessSchema,
  NUMBERED_PROCESS_DEFAULTS,
} from "./schema";

export const numberedProcessBlock = defineBlock({
  type: "numbered-process",
  category: "structure",
  name: "Numbered Process",
  description: "Pași numerotați pentru procese",
  icon: ListOrdered,
  schema: numberedProcessSchema,
  defaults: NUMBERED_PROCESS_DEFAULTS,
  Editor: NumberedProcessEditor,
  Renderer: NumberedProcess,
});
