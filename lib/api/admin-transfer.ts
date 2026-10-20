import { serverApiFetch } from "./server";

/** A pending "Transferă organizația", as the admin's and FDSC's screens see it. */
export interface AdminTransfer {
  documentId: string;
  initiatedBy: "ngo-admin" | "fdsc";
  initiatorName: string | null;
  recipientName: string | null;
  recipientEmail: string;
  recipientIsNewAccount: boolean;
  expiresAt: string;
  /** False for the ONG admin on a transfer FDSC started (US-5 AC1). */
  canManage: boolean;
}

export interface TransferCandidate {
  documentId: string;
  nume: string;
  email: string;
  accountStatus: "pending" | "active" | "deleted";
}

export interface FdscAdminTransferDetail {
  transfer: AdminTransfer | null;
  ongStatus: string;
  members: TransferCandidate[];
}

export type TransferTargetInput =
  | { mode: "member"; memberDocumentId: string }
  | { mode: "email"; nume: string; email: string };

export type TransferPreview =
  | {
      valid: true;
      documentId: string;
      ongName: string;
      initiatedBy: "ngo-admin" | "fdsc";
      initiatorName: string | null;
      expiresAt: string;
      recipientType: "existing" | "new";
      recipientDocumentId: string;
      recipientName: string | null;
      recipientEmailMasked: string;
    }
  | { valid: false; reason: "invalid" | "expired" | "resolved" };

export async function getCurrentAdminTransfer(): Promise<AdminTransfer | null> {
  const res = await serverApiFetch<{ data: AdminTransfer | null }>("/api/admin-transfers/current");
  return res.data;
}

export async function getFdscAdminTransfer(ongDocumentId: string): Promise<FdscAdminTransferDetail> {
  const res = await serverApiFetch<{ data: FdscAdminTransferDetail }>(
    `/api/ongs/${ongDocumentId}/admin-transfer`,
  );
  return res.data;
}

/** The token is the credential here, so a stale session must not get in the way. */
export async function previewAdminTransfer(token: string): Promise<TransferPreview> {
  const res = await serverApiFetch<{ data: TransferPreview }>(
    "/api/admin-transfers/preview",
    { method: "POST", body: JSON.stringify({ token }) },
    { anonymous: true },
  );
  return res.data;
}

/** A pending proposal addressed to the signed-in member (D11). */
export interface IncomingAdminTransfer {
  documentId: string;
  ongName: string;
  initiatedBy: "ngo-admin" | "fdsc";
  initiatorName: string | null;
  expiresAt: string;
  /** `/transfer-admin?token=…`, the same page the email links to. */
  path: string;
}

export async function getIncomingAdminTransfer(): Promise<IncomingAdminTransfer | null> {
  const res = await serverApiFetch<{ data: IncomingAdminTransfer | null }>(
    "/api/admin-transfers/incoming",
  );
  return res.data;
}
