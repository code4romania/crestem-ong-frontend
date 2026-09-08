import { Users } from "lucide-react";
import { defineBlock } from "../../types";
import { PeopleGridEditor } from "./Editor";
import { PeopleGrid } from "./PeopleGrid";
import { peopleGridSchema, PEOPLE_GRID_DEFAULTS } from "./schema";

export const peopleGridBlock = defineBlock({
  type: "people-grid",
  category: "cards",
  name: "People Grid",
  description: "Grilă de persoane / echipă / mentori",
  icon: Users,
  schema: peopleGridSchema,
  defaults: PEOPLE_GRID_DEFAULTS,
  Editor: PeopleGridEditor,
  Renderer: PeopleGrid,
});
