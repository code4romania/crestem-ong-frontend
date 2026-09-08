import { AlignCenter } from "lucide-react";
import { defineBlock } from "../../types";
import { HeroCenteredEditor } from "./Editor";
import { HeroCentered } from "./HeroCentered";
import { heroCenteredSchema, HERO_CENTERED_DEFAULTS } from "./schema";

export const heroCenteredBlock = defineBlock({
  type: "hero-centered",
  category: "hero",
  name: "Hero – Centered",
  description: "Titlu centrat, subtitlu și butoane de acțiune",
  icon: AlignCenter,
  fullBleed: true,
  schema: heroCenteredSchema,
  defaults: HERO_CENTERED_DEFAULTS,
  Editor: HeroCenteredEditor,
  Renderer: HeroCentered,
});
