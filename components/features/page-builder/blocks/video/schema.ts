import { z } from "zod";

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);

/**
 * Pulls the video id out of a YouTube or Vimeo link. Parses with `URL` and
 * checks the hostname against an allow-list first, so look-alike hosts
 * (`notyoutube.com/watch?v=...`) are rejected. Returns `null` when the string
 * isn't a recognisable URL for that provider, which is what the blank-draft
 * gate checks. `getEmbedSrc` in `Video.tsx` re-parses the same way.
 */
export function parseVideoId(
  provider: "youtube" | "vimeo",
  raw: string,
): string | null {
  const value = raw.trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();

  if (provider === "youtube") {
    if (!YOUTUBE_HOSTS.has(host)) return null;
    if (host === "youtu.be") {
      const id = url.pathname.split("/")[1] ?? "";
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    const v = url.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;
    const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/);
    return match ? match[1] : null;
  }

  if (!VIMEO_HOSTS.has(host)) return null;
  const match = url.pathname.match(/^\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

const uploadedVideoSchema = z.object({
  id: z.number(),
  url: z.string(),
  name: z.string().default(""),
});

export const videoSchema = z
  .object({
    sursaTip: z.enum(["youtube", "vimeo", "fisier"]).default("youtube"),
    // YouTube / Vimeo link, or a pasted URL to an already-hosted file when
    // `sursaTip === "fisier"`. Spec asks for "selectat din Media Library" too,
    // but that admin page is still a stub — the paste field covers it for now.
    sursaUrl: z.string().trim().default(""),
    fisier: uploadedVideoSchema.nullable().default(null),
    altText: z.string().trim().default(""),
    titlu: z.string().trim().default(""),
    descriere: z.string().trim().default(""),
    legenda: z.string().trim().default(""),
    credit: z.string().trim().default(""),
    latime: z.enum(["compacta", "standard", "lata", "full"]).default("standard"),
    raport: z.enum(["16:9", "4:3", "original"]).default("16:9"),
    autoplay: z.boolean().default(false),
    controale: z.boolean().default(true),
    loop: z.boolean().default(false),
    mut: z.boolean().default(false),
  })
  .superRefine((d, ctx) => {
    if (d.sursaTip === "fisier") {
      if (!d.fisier && !d.sursaUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sursaUrl"],
          message: "Încarcă un fișier video sau lipește un URL",
        });
      }
      // A local <video> with no controls has no way to start or pause
      // playback — only YouTube/Vimeo keep a click-to-play button when the
      // control bar is hidden.
      if (!d.controale) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["controale"],
          message:
            "Pentru fișiere video, controalele trebuie afișate (altfel redarea nu poate fi pornită sau oprită).",
        });
      }
      return;
    }
    if (!parseVideoId(d.sursaTip, d.sursaUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sursaUrl"],
        message:
          d.sursaTip === "youtube"
            ? "Adaugă un link YouTube valid"
            : "Adaugă un link Vimeo valid",
      });
    }
  });

export type VideoData = z.infer<typeof videoSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.superRefine` makes that throw.
 * `sursaUrl: ""` + `fisier: null` is intentionally invalid so a blank draft
 * can't pass validation when the admin clicks "Adaugă blocul".
 */
export const VIDEO_DEFAULTS: VideoData = {
  sursaTip: "youtube",
  sursaUrl: "",
  fisier: null,
  altText: "",
  titlu: "",
  descriere: "",
  legenda: "",
  credit: "",
  latime: "standard",
  raport: "16:9",
  autoplay: false,
  controale: true,
  loop: false,
  mut: false,
};
