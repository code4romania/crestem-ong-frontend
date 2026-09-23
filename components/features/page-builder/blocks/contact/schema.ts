import { z } from "zod";
import { SOCIAL_PLATFORMS } from "@/lib/api/footer-types";

/**
 * Paleta fixă de iconițe pentru rândurile de informații. Stocată ca string
 * (nu ca referință de componentă), ca la `category-grid`: schema rămâne
 * serializabilă, iar `icons.ts` mapează cheia la un icon `lucide-react` abia
 * la randare.
 */
export const CONTACT_ICON_KEYS = [
  "map-pin",
  "phone",
  "smartphone",
  "mail",
  "clock",
  "globe",
  "building",
  "user",
  "message-circle",
  "printer",
  "calendar",
  "info",
] as const;

export type ContactIconKey = (typeof CONTACT_ICON_KEYS)[number];

const infoItemSchema = z.object({
  icon: z.enum(CONTACT_ICON_KEYS).default("map-pin"),
  label: z.string().trim().default(""),
  value: z.string().trim().default(""),
});

const socialSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS).default("facebook"),
  /** Numele rețelei, folosit doar când `platform` e `other`. */
  label: z.string().trim().default(""),
  url: z.string().trim().default(""),
});

export const contactSchema = z
  .object({
    formTitle: z.string().trim().default("Trimite-ne un mesaj"),
    subjects: z.array(z.string().trim()).default([]),
    privacyUrl: z.string().trim().default(""),
    infoTitle: z.string().trim().default("Informații de contact"),
    infoItems: z.array(infoItemSchema).default([]),
    socialTitle: z.string().trim().default("SOCIAL MEDIA"),
    socials: z.array(socialSchema).default([]),
    mapEnabled: z.boolean().default(false),
    mapTitle: z.string().trim().default("LOCAȚIE"),
    mapAddress: z.string().trim().default(""),
  })
  .refine((d) => d.subjects.every((s) => s.length > 0), {
    path: ["subjects"],
    message: "Un subiect nu poate fi gol",
  })
  .refine((d) => new Set(d.subjects).size === d.subjects.length, {
    path: ["subjects"],
    message: "Subiectele trebuie să fie diferite între ele",
  })
  .refine((d) => d.infoItems.every((i) => i.value.length > 0), {
    path: ["infoItems"],
    message: "Fiecare rând de informații are nevoie de o valoare",
  })
  .refine((d) => d.socials.every((s) => s.url.length > 0), {
    path: ["socials"],
    message: "Fiecare rețea are nevoie de un link",
  })
  .refine((d) => !d.mapEnabled || d.mapAddress.length > 0, {
    path: ["mapAddress"],
    message: "Adresa este obligatorie cât timp harta este afișată",
  });

export type ContactData = z.infer<typeof contactSchema>;
export type ContactInfoItem = z.infer<typeof infoItemSchema>;
export type ContactSocial = z.infer<typeof socialSchema>;

/**
 * Fiecare câmp are un default în schemă, deci un bloc proaspăt e deja valid —
 * dar fără subiecte, iar formularul cere cel puțin unul ca să fie folosibil.
 * Randarea arată un mesaj în locul selectului cât timp lista e goală.
 */
export const CONTACT_DEFAULTS: ContactData = {
  formTitle: "Trimite-ne un mesaj",
  subjects: [],
  privacyUrl: "",
  infoTitle: "Informații de contact",
  infoItems: [],
  socialTitle: "SOCIAL MEDIA",
  socials: [],
  mapEnabled: false,
  mapTitle: "LOCAȚIE",
  mapAddress: "",
};

export const EMPTY_INFO_ITEM: ContactInfoItem = {
  icon: "map-pin",
  label: "",
  value: "",
};

export const EMPTY_SOCIAL: ContactSocial = {
  platform: "facebook",
  label: "",
  url: "",
};
