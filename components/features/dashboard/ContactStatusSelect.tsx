"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { updateContactStatusAction } from "@/lib/api/contact-actions";
import { CONTACT_STATUSES, CONTACT_STATUS_LABEL, type ContactStatus } from "@/lib/api/contact-types";
import { contactStatusChipClass } from "./contact-status";

export function ContactStatusSelect({
  documentId,
  status,
}: {
  documentId: string;
  status: ContactStatus;
}) {
  // Optimist, seedat din prop: chip-ul se schimbă imediat, iar la finalul
  // tranziției revine automat la `status` — fie valoarea reală adusă de
  // revalidare, fie cea veche, dacă acțiunea a picat.
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    status,
    (_current, next: ContactStatus) => next,
  );
  const [pending, startTransition] = useTransition();

  function onChange(next: ContactStatus) {
    startTransition(async () => {
      setOptimisticStatus(next);
      try {
        const result = await updateContactStatusAction(documentId, next);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Statusul a fost actualizat.");
      } catch {
        toast.error("A apărut o eroare neașteptată. Încearcă din nou.");
      }
    });
  }

  return (
    <select
      value={optimisticStatus}
      disabled={pending}
      aria-label="Status"
      // Selectul stă într-un rând care deschide modalul la click — fără asta,
      // fiecare schimbare de status ar deschide și dialogul.
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value as ContactStatus)}
      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none disabled:opacity-60 ${contactStatusChipClass(optimisticStatus)}`}
    >
      {CONTACT_STATUSES.map((value) => (
        <option key={value} value={value}>
          {CONTACT_STATUS_LABEL[value]}
        </option>
      ))}
    </select>
  );
}
