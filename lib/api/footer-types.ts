/**
 * Shapes and labels for the footer, kept apart from `footer.ts` so client
 * components can import them without pulling in `serverApiFetch` — and with it
 * `next/headers`, which only server code may touch.
 */
export const KNOWN_PLATFORMS = [
  "facebook",
  "twitter",
  "instagram",
  "linkedin",
  "youtube",
  "tiktok",
  "github",
] as const;

/** `other` is any network without a built-in icon; it supplies its own name. */
export const SOCIAL_PLATFORMS = [...KNOWN_PLATFORMS, "other"] as const;

export type KnownPlatform = (typeof KNOWN_PLATFORMS)[number];
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_LABEL: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  twitter: "X (Twitter)",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  github: "GitHub",
  other: "Altă rețea",
};

export interface SocialLink {
  platform: SocialPlatform;
  /** Set only when `platform` is `other`, where it names the network. */
  label?: string;
  url: string;
}

/** What the footer shows next to a link: its own name, or the platform's. */
export function socialName(social: SocialLink): string {
  return social.platform === "other"
    ? (social.label ?? SOCIAL_LABEL.other)
    : SOCIAL_LABEL[social.platform];
}

export interface FooterContent {
  /** Sanitised HTML from the TipTap surface. May contain uploaded images. */
  description: string;
  copyright: string;
  socials: SocialLink[];
}
