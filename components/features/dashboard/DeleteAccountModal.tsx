"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccountAction } from "@/lib/api/account-actions";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

const DELETE_CONFIRMATION_WORD = "STERGE";

export function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmare, setConfirmare] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    currentPassword.length > 0 && confirmare === DELETE_CONFIRMATION_WORD && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await deleteAccountAction({ currentPassword, confirmare });
    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Contul a fost șters.");
    router.replace("/");
    router.refresh();
  }

  return (
    <ModalOverlay labelledBy="delete-account-title">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-md p-6">
        <h2
          id="delete-account-title"
          className="font-heading font-extrabold text-lg mb-2"
          style={{ color: "#1c1c81" }}
        >
          Șterge contul
        </h2>

        <div className="text-sm text-muted-foreground mb-4 space-y-2">
          <p>
            Datele tale personale — nume, email, telefon, fotografie — sunt eliminate definitiv.
          </p>
          <p>
            Activitatea ta rămâne pe platformă și apare ca <strong>Anonim</strong>: răspunsurile la
            matrice, comentariile, mesajele și documentele încărcate.
          </p>
          <p>
            Acțiunea nu poate fi anulată. Dacă revii pe platformă, creezi un cont nou, fără istoric.
          </p>
        </div>

        <label
          htmlFor="delete-account-current-password"
          className="block text-sm font-semibold mb-1"
          style={{ color: "#1c1c81" }}
        >
          Parola actuală
        </label>
        <input
          id="delete-account-current-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full mb-4 rounded-xl border border-border px-3 py-2.5 text-sm"
        />

        <label
          htmlFor="delete-account-confirmare"
          className="block text-sm font-semibold mb-1"
          style={{ color: "#1c1c81" }}
        >
          Scrie {DELETE_CONFIRMATION_WORD} pentru a confirma
        </label>
        <input
          id="delete-account-confirmare"
          type="text"
          value={confirmare}
          onChange={(e) => setConfirmare(e.target.value)}
          autoComplete="off"
          className="w-full mb-4 rounded-xl border border-border px-3 py-2.5 text-sm"
        />

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg px-3 py-2 text-sm bg-[#fff5f5] border-[1.5px] border-[#fca5a5] text-[#b91c1c]"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50"
            style={{ color: "#1c1c81" }}
          >
            Anulează
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#dc2626] disabled:opacity-50"
          >
            {loading ? "Se șterge..." : "Șterge contul"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
