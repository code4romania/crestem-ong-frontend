"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { FIRST_LOGIN_PARAM } from "@/lib/first-login";

const PROFILE_PATH = "/dashboard/profil";

/**
 * Greets an NGO admin on the login that created their account's first session
 * and points them at the organization profile, where the details the
 * registration form no longer asks for are filled in. Answering it either way
 * drops the query param, so a re-render never brings it back.
 */
export function FirstLoginProfilePrompt() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (searchParams.get(FIRST_LOGIN_PARAM) !== "1") return null;

  const dismiss = () => {
    const rest = new URLSearchParams(searchParams);
    rest.delete(FIRST_LOGIN_PARAM);
    const query = rest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <ModalOverlay labelledBy="first-login-prompt-title">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h2
          id="first-login-prompt-title"
          className="font-heading font-extrabold text-lg mb-2 text-[#1c1c81]"
        >
          Bine ai venit!
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Profilul organizației tale mai are nevoie de câteva informații (adresă,
          domenii de activitate, descriere, website). Le poți completa acum din
          pagina <span className="font-semibold text-[#1c1c81]">Profilul meu</span> sau
          mai târziu, oricând.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={dismiss}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors text-[#475569]"
          >
            Mai târziu
          </button>
          <button
            type="button"
            onClick={() => router.replace(PROFILE_PATH)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:brightness-90 transition-opacity bg-[#00d495]"
          >
            Completează profilul
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
