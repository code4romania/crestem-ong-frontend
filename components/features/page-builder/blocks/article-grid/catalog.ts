import {
  BookOpen,
  FileText,
  Layers,
  Mic,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { ArticleCategory } from "./schema";

export interface CatalogArticle {
  slug: string;
  titlu: string;
  excerpt: string;
  categorie: ArticleCategory;
  tags: string[];
  /** ISO date — drives the "Cele mai recente" ordering and the picker meta line. */
  data: string;
}

/**
 * Mock article catalog. The "Bibliotecă" content type does not exist yet (no
 * Strapi model, nothing in the OpenAPI spec), so the block reads from this until
 * a real endpoint replaces it — swap `ARTICLE_CATALOG` for a fetch and the
 * editor + renderer are unchanged.
 */
export const ARTICLE_CATALOG: CatalogArticle[] = [
  {
    slug: "echipa-voluntari-eficienta",
    titlu: "Cum să construiești o echipă de voluntari eficientă",
    excerpt:
      "Recrutare, onboarding și motivare pe termen lung — un ghid practic pentru coordonatorii de voluntari din ONG-uri.",
    categorie: "ghid",
    tags: ["voluntariat", "echipă", "management"],
    data: "2026-05-12",
  },
  {
    slug: "transparenta-financiara-bune-practici",
    titlu: "Transparența financiară în ONG-uri: bune practici",
    excerpt:
      "De la raportarea publică a bugetului la comunicarea cu finanțatorii — ce înseamnă transparența în practică.",
    categorie: "articol",
    tags: ["finanțe", "transparență", "raportare"],
    data: "2026-05-05",
  },
  {
    slug: "accesarea-fondurilor-europene",
    titlu: "Accesarea fondurilor europene — ghid complet",
    excerpt:
      "Pași, documente și greșeli frecvente în depunerea unei cereri de finanțare pentru organizații neguvernamentale.",
    categorie: "ghid",
    tags: ["finanțare", "fonduri UE", "proiecte"],
    data: "2026-04-28",
  },
  {
    slug: "impact-social-programe-tineret",
    titlu: "Impactul social al programelor de tineret",
    excerpt:
      "Cum a măsurat o organizație locală rezultatele pe trei ani și ce a schimbat în strategia de program.",
    categorie: "studiu-de-caz",
    tags: ["tineret", "impact", "evaluare"],
    data: "2026-04-15",
  },
  {
    slug: "interviu-director-executiv-guvernanta",
    titlu: "Interviu: rolul consiliului director într-un ONG matur",
    excerpt:
      "O discuție despre guvernanță, delegare și relația dintre board și echipa executivă.",
    categorie: "interviu",
    tags: ["guvernanță", "leadership", "consiliu"],
    data: "2026-04-03",
  },
  {
    slug: "video-comunicare-campanii",
    titlu: "Comunicarea unei campanii de strângere de fonduri",
    excerpt:
      "Un scurt material despre mesaj, canale și calendar pentru campaniile de fundraising.",
    categorie: "video",
    tags: ["comunicare", "fundraising", "campanii"],
    data: "2026-03-22",
  },
  {
    slug: "ghid-protectia-datelor-gdpr",
    titlu: "Protecția datelor (GDPR) pentru organizații mici",
    excerpt:
      "Registrul de prelucrări, temeiuri legale și consimțământ — minimul necesar pentru conformitate.",
    categorie: "ghid",
    tags: ["GDPR", "conformitate", "date personale"],
    data: "2026-03-10",
  },
  {
    slug: "studiu-parteneriat-multi-anual",
    titlu: "Studiu de caz: un parteneriat strategic pe cinci ani",
    excerpt:
      "Cum au construit două organizații un parteneriat durabil, de la memorandum la proiecte comune.",
    categorie: "studiu-de-caz",
    tags: ["parteneriate", "colaborare", "strategie"],
    data: "2026-02-26",
  },
  {
    slug: "articol-masurarea-impactului",
    titlu: "Măsurarea impactului: indicatori care contează",
    excerpt:
      "Cum alegi un set mic de indicatori relevanți în loc să raportezi tot ce poți număra.",
    categorie: "articol",
    tags: ["impact", "indicatori", "monitorizare"],
    data: "2026-02-11",
  },
];

export interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  badgeBg: string;
  badgeFg: string;
}

/** Label, badge colour and icon per category. Colours picked to sit on white — no Figma source, only screenshots. */
export const CATEGORY_META: Record<ArticleCategory, CategoryMeta> = {
  ghid: { label: "Ghid", icon: BookOpen, badgeBg: "#eff6ff", badgeFg: "#2563eb" },
  articol: {
    label: "Articol",
    icon: FileText,
    badgeBg: "#f0fdf4",
    badgeFg: "#16a34a",
  },
  "studiu-de-caz": {
    label: "Studiu de caz",
    icon: Layers,
    badgeBg: "#fff7ed",
    badgeFg: "#ea580c",
  },
  interviu: { label: "Interviu", icon: Mic, badgeBg: "#faf5ff", badgeFg: "#9333ea" },
  video: { label: "Video", icon: Video, badgeBg: "#fdf2f8", badgeFg: "#db2777" },
};

const RO_MONTHS = [
  "ian.",
  "feb.",
  "mar.",
  "apr.",
  "mai",
  "iun.",
  "iul.",
  "aug.",
  "sep.",
  "oct.",
  "nov.",
  "dec.",
];

/** "2026-05-12" -> "12 mai 2026". Falls back to the raw string if unparseable. */
export function formatArticleDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  const label = RO_MONTHS[Number(month) - 1];
  if (!label) return iso;
  return `${Number(day)} ${label} ${year}`;
}
