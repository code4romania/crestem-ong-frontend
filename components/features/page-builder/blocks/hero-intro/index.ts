import { Pilcrow } from "lucide-react";
import { defineBlock } from "../../types";
import { HeroIntroEditor } from "./Editor";
import { HeroIntro } from "./HeroIntro";
import { heroIntroSchema, HERO_INTRO_DEFAULTS } from "./schema";

export const heroIntroBlock = defineBlock({
  type: "hero-intro",
  category: "hero",
  name: "Hero – Intro",
  description: "Secțiune intro cu fundal colorat și text scurt",
  icon: Pilcrow,
  fullBleed: true,
  schema: heroIntroSchema,
  defaults: HERO_INTRO_DEFAULTS,
  Editor: HeroIntroEditor,
  Renderer: HeroIntro,
});
