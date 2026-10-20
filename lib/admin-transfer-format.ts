export function transferRecipientLabel(transfer: {
  recipientName: string | null;
  recipientEmail: string;
}): string {
  return transfer.recipientName
    ? `${transfer.recipientName} (${transfer.recipientEmail})`
    : transfer.recipientEmail;
}

/** Who the recipient is told proposed them: FDSC as a team, an admin by name. */
export function transferProposerLabel(transfer: {
  initiatedBy: "ngo-admin" | "fdsc";
  initiatorName: string | null;
}): string {
  if (transfer.initiatedBy === "fdsc") return "Echipa FDSC";
  return transfer.initiatorName ?? "Administratorul organizației";
}

export function formatTransferDate(iso: string): string {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Bucharest",
  }).format(new Date(iso));
}

/** Lowercase and strip diacritics (both ș/ş and ț/ţ forms decompose). */
function foldForSearch(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Member picker filter: name or email, case- and diacritic-insensitive. */
export function matchesMemberSearch(
  member: { nume: string; email: string },
  query: string,
): boolean {
  const q = foldForSearch(query.trim());
  if (!q) return true;
  return foldForSearch(member.nume).includes(q) || foldForSearch(member.email).includes(q);
}
