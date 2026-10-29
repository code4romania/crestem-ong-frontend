"use client";

import { ModalOverlay } from "@/components/ui/ModalOverlay";

/**
 * Shown when a save is refused because the round closed while the respondent
 * was filling it in — finished early or past its phase. There is nothing left
 * to do on the questionnaire, so the only way out is "Am înțeles".
 */
export function RoundClosedModal({ onAcknowledge }: { onAcknowledge: () => void }) {
  return (
    <ModalOverlay labelledBy="round-closed-title">
      <div className="bg-white rounded-2xl w-full max-w-md p-8">
        <h2 id="round-closed-title" className="font-heading font-extrabold text-xl mb-3 text-center text-[#1c1c81]">
          Evaluarea a fost închisă
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Această evaluare a fost închisă și nu mai poate fi completată. Răspunsurile pe care le-ai salvat până acum
          au fost păstrate, dar modificările de pe pagina curentă nu au putut fi salvate.
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            autoFocus
            onClick={onAcknowledge}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#00d495] text-white hover:brightness-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1c81] focus-visible:ring-offset-2"
          >
            Am înțeles
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
