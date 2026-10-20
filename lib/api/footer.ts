import { serverApiFetch } from "./server";
import { sanitizeFooterRichText } from "@/lib/footer-rich-text.server";
import type { FooterContent } from "./footer-types";

export * from "./footer-types";

/**
 * The footer's left side. Its columns come from the footer menu instead.
 *
 * `description` is sanitised here rather than in `Footer`: the footer renders
 * inside `SiteChrome`, a client component, and DOMPurify in a client module
 * graph pulls jsdom into the client-SSR bundle — which breaks every HTML render
 * once the build is packed into a serverless function.
 */
export async function getFooter(): Promise<FooterContent> {
  const { data } = await serverApiFetch<{ data: FooterContent }>("/api/footer");
  return { ...data, description: sanitizeFooterRichText(data.description ?? "") };
}
