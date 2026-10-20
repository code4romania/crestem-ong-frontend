"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/api/client";

const FALLBACK_NAME = "export.xlsx";
const FALLBACK_ERROR = "Nu am putut genera fișierul.";

/** The backend sends an ASCII `filename="…"`, so a plain match is enough. */
function fileNameOf(response: Response) {
  const header = response.headers.get("content-disposition") ?? "";
  return header.match(/filename="([^"]+)"/)?.[1] ?? FALLBACK_NAME;
}

/**
 * Fetches a generated file from one of our route handlers and saves it under
 * the name the backend chose, so a failure shows as a toast instead of a raw
 * JSON page. `href` is read on click, so it can follow live filters.
 */
export function DownloadButton({
  href,
  label,
  className,
  style,
  iconSize = 13,
}: {
  href: string;
  label: string;
  className?: string;
  style?: React.CSSProperties;
  iconSize?: number;
}) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(href);
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(errorMessage(data?.message, FALLBACK_ERROR));
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
      toast.error(errorMessage(err, FALLBACK_ERROR));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      className={`cursor-pointer disabled:cursor-wait disabled:opacity-60 ${className ?? ""}`}
      style={style}
    >
      {busy ? (
        <Loader2 size={iconSize} className="animate-spin" aria-hidden />
      ) : (
        <Download size={iconSize} aria-hidden />
      )}
      {busy ? "Se pregătește..." : label}
    </button>
  );
}
