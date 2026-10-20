import { Mail } from "lucide-react";
import { defineBlock } from "../../types";
import { ContactEditor } from "./Editor";
import { Contact } from "./Contact";
import { contactSchema, CONTACT_DEFAULTS } from "./schema";

export const contactBlock = defineBlock({
  type: "contact",
  category: "forms",
  name: "Contact",
  description: "Formular de contact cu informații, social media și hartă",
  icon: Mail,
  schema: contactSchema,
  defaults: CONTACT_DEFAULTS,
  Editor: ContactEditor,
  Renderer: Contact,
});
