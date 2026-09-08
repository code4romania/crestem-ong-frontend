"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * "Descarcă toate" — POSTs the file list to `/api/page-blocks/documents-zip`,
 * which fetches every file server-side (no CORS on the media host) and streams
 * back one zip. Files that couldn't be fetched are reported via `X-Zip-Failed`.
 */
export function DownloadAllButton({
  files,
  zipName,
  className,
}: {
  files: { url: string; name: string }[];
  zipName?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/page-blocks/documents-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, zipName }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(data?.message ?? "Nu am putut genera arhiva.");
      }

      const blob = await res.blob();
      const failed = Number(res.headers.get("X-Zip-Failed") ?? 0);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${zipName || "documente"}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);

      if (failed > 0) {
        toast.warning(
          `Arhiva a fost creată, dar ${failed} ${
            failed === 1
              ? "fișier nu a putut fi inclus"
              : "fișiere nu au putut fi incluse"
          }.`,
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nu am putut genera arhiva.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      className={className}
    >
      {busy ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Download size={15} />
      )}
      {busy ? "Se pregătește..." : "Descarcă toate"}
    </button>
  );
}
