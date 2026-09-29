import { z } from "zod";
import { iconSchema } from "@/components/ui/icons/schema";
import { CTA_DEFAULTS, ctaHasTarget, ctaSchema } from "../shared/cta";
import { hasRichText } from "../../rich-text/has-rich-text";

export const calloutSchema = z
  .object({
    icon: iconSchema("callout", "megaphone"),
    afiseazaIcon: z.boolean().default(true),
    titlu: z.string().trim().default(""),
    /**
     * HTML produced by the shared TipTap editor. Sanitised server-side on the
     * way to the backend (`sanitizeBlocks`), not here: this schema also runs in
     * the editor, and DOMPurify must stay out of the client bundle.
     */
    text: z.string().default(""),
    primaryCta: ctaSchema.default(CTA_DEFAULTS),
    secondaryCta: ctaSchema.default(CTA_DEFAULTS),
    aliniere: z.enum(["stanga", "centru", "dreapta"]).default("centru"),
  })
  .refine((d) => hasRichText(d.text), {
    path: ["text"],
    message: "Textul nu poate fi gol",
  })
  .refine((d) => Boolean(d.primaryCta.label) === ctaHasTarget(d.primaryCta), {
    path: ["primaryCta"],
    message: "Completează și textul, și link-ul",
  })
  .refine((d) => Boolean(d.secondaryCta.label) === ctaHasTarget(d.secondaryCta), {
    path: ["secondaryCta"],
    message: "Completează și textul, și link-ul",
  });

export type CalloutData = z.infer<typeof calloutSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `text: ""` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const CALLOUT_DEFAULTS: CalloutData = {
  icon: "lucide:megaphone",
  afiseazaIcon: true,
  titlu: "",
  text: "",
  primaryCta: { ...CTA_DEFAULTS },
  secondaryCta: { ...CTA_DEFAULTS },
  aliniere: "centru",
};
