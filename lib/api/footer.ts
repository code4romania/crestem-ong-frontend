import { serverApiFetch } from "./server";
import type { FooterContent } from "./footer-types";

export * from "./footer-types";

/** The footer's left side. Its columns come from the footer menu instead. */
export async function getFooter(): Promise<FooterContent> {
  const { data } = await serverApiFetch<{ data: FooterContent }>("/api/footer");
  return data;
}
