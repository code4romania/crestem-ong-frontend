import { serverApiFetch } from "./server";
import { sanitizeRichText } from "@/components/features/page-builder/rich-text/sanitize.server";

export interface MentorProfile {
  nume: string | null;
  email: string;
  createdAt: string | null;
  bio: string | null;
  dimensiuni: string[];
  ariiDeExpertiza: string[];
  avatar: { id: number; url: string } | null;
}

/**
 * `bio` is sanitised here rather than in `MentorProfileDetailsCard`: that card
 * is a client component, and DOMPurify in a client module graph pulls jsdom
 * into the client-SSR bundle, which breaks every HTML render on a serverless
 * deploy. Rows written before sanitising moved server-side are covered too.
 */
export async function getMentorProfile() {
  const { data } = await serverApiFetch<{ data: MentorProfile }>("/api/mentors/me");
  return { data: { ...data, bio: data.bio === null ? null : sanitizeRichText(data.bio) } };
}
