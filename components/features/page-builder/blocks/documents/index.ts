import { Files } from "lucide-react";
import { defineBlock } from "../../types";
import { DocumentsEditor } from "./Editor";
import { Documents } from "./Documents";
import { documentsSchema, DOCUMENTS_DEFAULTS } from "./schema";

export const documentsBlock = defineBlock({
  type: "documents",
  category: "media",
  name: "Documente",
  description:
    "Listă de fișiere descărcabile (PDF, DOCX, XLSX), cu titlu și subtitlu",
  icon: Files,
  schema: documentsSchema,
  defaults: DOCUMENTS_DEFAULTS,
  Editor: DocumentsEditor,
  Renderer: Documents,
});
