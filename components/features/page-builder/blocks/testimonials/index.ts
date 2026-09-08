import { Quote } from "lucide-react";
import { defineBlock } from "../../types";
import { TestimonialsEditor } from "./Editor";
import { Testimonials } from "./Testimonials";
import { testimonialsSchema, TESTIMONIALS_DEFAULTS } from "./schema";

export const testimonialsBlock = defineBlock({
  type: "testimonials",
  category: "dynamic",
  name: "Testimonials",
  description: "Carusel sau grilă de testimoniale",
  icon: Quote,
  schema: testimonialsSchema,
  defaults: TESTIMONIALS_DEFAULTS,
  Editor: TestimonialsEditor,
  Renderer: Testimonials,
});
