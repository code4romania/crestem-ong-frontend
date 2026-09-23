"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { confirmEmailChangeAction } from "@/lib/api/auth-actions";

export function ConfirmEmailChange({ token, email }: { token: string; email: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      // On success the action redirects to ?confirmat=... — it only returns
      // here when the confirmation failed.
      const result = await confirmEmailChangeAction(token);
      setError(result.error);
    });
  };

  return (
    <>
      <p className="text-sm text-muted-foreground mt-2">
        Vrei să schimbi adresa contului în{" "}
        <span className="font-semibold" style={{ color: "#162040" }}>
          {email}
        </span>
        ? După confirmare vei folosi noua adresă pentru autentificare și vei fi
        deconectat de pe toate dispozitivele.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg px-3 py-2 text-sm bg-[#fff5f5] border-[1.5px] border-[#fca5a5] text-[#ef4444]">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={isPending}
        className="mt-6 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70 transition-opacity"
        style={{ background: "#2dbe8f" }}
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        {isPending ? "Se confirmă..." : "Confirmă schimbarea"}
      </button>
    </>
  );
}
