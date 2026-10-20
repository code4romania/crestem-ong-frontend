import { serverApiFetch } from "./server";
import type { ContactMessage, ContactPagination } from "./contact-types";

export interface ListContactMessagesParams {
  page?: number;
}

export function listContactMessages(params: ListContactMessagesParams = {}) {
  const query = new URLSearchParams();
  if (params.page && params.page > 1) query.set("page", String(params.page));

  const qs = query.toString();
  return serverApiFetch<{
    data: ContactMessage[];
    meta: { pagination: ContactPagination };
  }>(`/api/contacts${qs ? `?${qs}` : ""}`);
}
