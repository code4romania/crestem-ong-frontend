import { Megaphone } from "lucide-react";
import { defineBlock } from "../../types";
import { CalloutEditor } from "./Editor";
import { Callout } from "./Callout";
import { calloutSchema, CALLOUT_DEFAULTS } from "./schema";

export const calloutBlock = defineBlock({
  type: "callout",
  category: "text",
  name: "Callout",
  description: "Casetă de atenționare sau informare vizuală",
  icon: Megaphone,
  schema: calloutSchema,
  defaults: CALLOUT_DEFAULTS,
  Editor: CalloutEditor,
  Renderer: Callout,
});
