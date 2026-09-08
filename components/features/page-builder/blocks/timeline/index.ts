import { Milestone } from "lucide-react";
import { defineBlock } from "../../types";
import { TimelineEditor } from "./Editor";
import { Timeline } from "./Timeline";
import { timelineSchema, TIMELINE_DEFAULTS } from "./schema";

export const timelineBlock = defineBlock({
  type: "timeline",
  category: "structure",
  name: "Timeline",
  description: "Linie de timp verticală sau orizontală, cu etape",
  icon: Milestone,
  schema: timelineSchema,
  defaults: TIMELINE_DEFAULTS,
  Editor: TimelineEditor,
  Renderer: Timeline,
});
