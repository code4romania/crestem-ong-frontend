/**
 * Formele și etichetele mesajelor de contact, ținute separat de `contact.ts`
 * ca să le poată importa componentele client fără `serverApiFetch` — și, cu
 * el, `next/headers`, la care doar codul de server are voie.
 */
export const CONTACT_STATUSES = ["new", "in_progress", "closed"] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_STATUS_LABEL: Record<ContactStatus, string> = {
  new: "Nou",
  in_progress: "În lucru",
  closed: "Închis",
};

export interface ContactMessage {
  documentId: string;
  name: string;
  email: string;
  organization: string;
  subject: string;
  message: string;
  status: ContactStatus;
  consentedAt: string | null;
  createdAt: string | null;
}

export interface ContactPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}
