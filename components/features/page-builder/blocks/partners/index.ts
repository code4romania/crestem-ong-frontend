import { Handshake } from "lucide-react";
import { defineBlock } from "../../types";
import { PartnersEditor } from "./Editor";
import { Partners } from "./Partners";
import { partnersSchema, PARTNERS_DEFAULTS } from "./schema";

export const partnersBlock = defineBlock({
  type: "partners",
  category: "cards",
  name: "Parteneri",
  description: "Grilă de parteneri cu logo/iconiță, nume și subtitlu",
  icon: Handshake,
  schema: partnersSchema,
  defaults: PARTNERS_DEFAULTS,
  Editor: PartnersEditor,
  Renderer: Partners,
});
