"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/api/client";

const FALLBACK_NAME = "evaluare.xlsx";

/** The backend sends an ASCII `filename="…"`, so a plain match is enough. */
function fileNameOf(response: Response) {
  const header = response.headers.get("content-disposition") ?? "";
  return header.match(/filename="([^"]+)"/)?.[1] ?? FALLBACK_NAME;
}

/**
 * "Descarcă evaluarea" — fetches the round's `.xlsx` through
 * `/api/ongs/:id/evaluations/:reportId/export` and saves it, so a failure shows
 * as a toast instead of a raw JSON page.
 */
export function DownloadEvaluationButton({
  ongDocumentId,
  reportDocumentId,
}: {
  ongDocumentId: string;
  reportDocumentId: string;
}) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/ongs/${encodeURIComponent(ongDocumentId)}/evaluations/${encodeURIComponent(reportDocumentId)}/export`,
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(errorMessage(data?.message, "Nu am putut genera fișierul."));
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileNameOf(res);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      toast.error(errorMessage(err, "Nu am putut genera fișierul."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      className="inline-flex items-center gap-1 text-xs font-semibold cursor-pointer hover:underline disabled:cursor-wait disabled:opacity-60 disabled:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d495]/40 rounded"
      style={{ color: "#007d58" }}
    >
      {busy ? (
        <Loader2 size={13} className="animate-spin" aria-hidden />
      ) : (
        <Download size={13} aria-hidden />
      )}
      {busy ? "Se pregătește..." : "Descarcă evaluarea"}
    </button>
  );
}
