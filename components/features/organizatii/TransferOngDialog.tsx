"use client";

import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PasswordInput } from "@/components/features/auth/PasswordInput";
import type { TransferCandidate, TransferTargetInput } from "@/lib/api/admin-transfer";
import { matchesMemberSearch } from "@/lib/admin-transfer-format";
import {
  createAdminTransferAction,
  fdscCreateAdminTransferAction,
} from "@/lib/api/admin-transfer-actions";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors bg-white text-sm";

type Tab = "member" | "email";

/**
 * „Transferă organizația” (Admin ONG, US-1/US-2) and „Schimbă administratorul”
 * (Admin FDSC, US-5): pick an active member or invite an address without an
 * account. The ONG admin confirms with their password; FDSC does not (US-5 BR3).
 */
export function TransferOngDialog({
  mode,
  ongDocumentId,
  ongName,
  members,
  onClose,
}: {
  mode: "ngo-admin" | "fdsc";
  /** Required in `fdsc` mode — the organization being changed. */
  ongDocumentId?: string;
  ongName: string;
  members: TransferCandidate[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("member");
  const [memberId, setMemberId] = useState<string | null>(null);
  const [nume, setNume] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const isFdsc = mode === "fdsc";
  const selectedMember = members.find((m) => m.documentId === memberId) ?? null;
  const recipientLabel =
    tab === "member"
      ? selectedMember
        ? `${selectedMember.nume} (${selectedMember.email})`
        : null
      : email.trim()
        ? `${nume.trim() || email.trim()} (${email.trim()})`
        : null;

  const target: TransferTargetInput | null =
    tab === "member"
      ? memberId
        ? { mode: "member", memberDocumentId: memberId }
        : null
      : nume.trim() && email.trim()
        ? { mode: "email", nume, email }
        : null;

  const canSubmit = Boolean(target) && (isFdsc || password.length > 0) && !isPending;

  const handleSubmit = () => {
    if (!target) return;
    setFieldErrors({});
    startTransition(async () => {
      const result = isFdsc
        ? await fdscCreateAdminTransferAction(ongDocumentId as string, target)
        : await createAdminTransferAction({ ...target, password });
      if (result.error || Object.keys(result.fieldErrors ?? {}).length > 0) {
        // Toast, not an in-modal box, so a refusal can't be missed.
        if (result.error) toast.error(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      if (result.warning) {
        toast.warning(result.warning);
      } else {
        toast.success("Propunerea de transfer a fost trimisă.");
      }
      onClose();
      router.refresh();
    });
  };

  return (
    <ModalOverlay labelledBy="transfer-ong-title">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <div>
            <h2
              id="transfer-ong-title"
              className="font-heading font-extrabold text-lg"
              style={{ color: "#162040" }}
            >
              {isFdsc ? "Schimbă administratorul" : "Transferă organizația"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{ongName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto">
          <SegmentedControl<Tab>
            ariaLabel="Cui transferi rolul"
            value={tab}
            onChange={(next) => {
              setTab(next);
              setFieldErrors({});
            }}
            disabled={isPending}
            options={[
              { value: "member", label: "Membru al organizației" },
              { value: "email", label: "Invită pe email" },
            ]}
          />

          {tab === "member" ? (
            <MemberPicker members={members} value={memberId} onChange={setMemberId} disabled={isPending} />
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="transfer-nume"
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "#334155" }}
                >
                  Nume complet <span style={{ color: "#2dbe8f" }}>*</span>
                </label>
                <input
                  id="transfer-nume"
                  type="text"
                  className={inputClass}
                  value={nume}
                  onChange={(e) => setNume(e.target.value)}
                  placeholder="ex. Ion Popescu"
                  disabled={isPending}
                />
                {fieldErrors.nume && (
                  <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                    {fieldErrors.nume}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="transfer-email"
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "#334155" }}
                >
                  Adresă email <span style={{ color: "#2dbe8f" }}>*</span>
                </label>
                <input
                  id="transfer-email"
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ion.popescu@ong.ro"
                  disabled={isPending}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                    {fieldErrors.email}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Persoana nu trebuie să aibă cont pe platformă. Contul se creează când acceptă.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm" style={{ color: "#334155" }}>
            <p className="font-semibold mb-1.5" style={{ color: "#162040" }}>
              Ce se întâmplă
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                {recipientLabel ?? "Persoana aleasă"} primește un email cu propunerea și are 7 zile
                să răspundă.
              </li>
              <li>
                {isFdsc
                  ? "Până la acceptare, administratorul actual își păstrează rolul și toate drepturile."
                  : "Până la acceptare, rămâi administrator cu toate drepturile."}
              </li>
              <li>
                {isFdsc
                  ? "La acceptare, persoana devine administratorul organizației, iar administratorul actual iese din organizație."
                  : "La acceptare, persoana devine administratorul organizației, iar tu ieși complet din organizație. Contul tău devine cont individual."}
              </li>
            </ul>
          </div>

          {!isFdsc && (
            <div>
              <label
                htmlFor="transfer-password"
                className="block text-sm font-semibold mb-1.5"
                style={{ color: "#334155" }}
              >
                Parola ta actuală <span style={{ color: "#2dbe8f" }}>*</span>
              </label>
              {/* Without a username field, the password manager takes the
                  member search as one and fills it with the saved login. */}
              <input
                type="text"
                name="username"
                autoComplete="username"
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
              />
              <PasswordInput
                id="transfer-password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isPending}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                  {fieldErrors.password}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50 text-[#475569]"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-70"
            style={{ background: "#2dbe8f" }}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Se trimite..." : "Trimite propunerea"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function MemberPicker({
  members,
  value,
  onChange,
  disabled,
}: {
  members: TransferCandidate[];
  value: string | null;
  onChange: (documentId: string) => void;
  disabled: boolean;
}) {
  const [search, setSearch] = useState("");

  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Organizația nu are membri. Poți invita pe email o persoană care nu are cont pe platformă.
      </p>
    );
  }

  // A selected member hidden by the search stays selected; the summary below
  // still names them.
  const visible = members.filter((m) => matchesMemberSearch(m, search));

  // Fixed height so filtering doesn't resize the dialog; only the list scrolls.
  return (
    <div className="h-96 flex flex-col rounded-xl border border-border overflow-hidden">
      <div className="relative shrink-0 p-2 border-b border-border">
        <Search
          size={14}
          className="absolute left-5.5 top-1/2 -translate-y-1/2"
          style={{ color: "#94a3b8" }}
          aria-hidden
        />
        <input
          type="search"
          name="member-search"
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          aria-label="Caută membri"
          placeholder="Caută după nume sau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors"
        />
      </div>

      {/* The padding keeps the focus ring from being clipped. */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2">
        {visible.length === 0 ? (
          <p className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Niciun membru găsit.
          </p>
        ) : (
          <div role="radiogroup" aria-label="Membrii organizației" className="space-y-2">
            {visible.map((member) => {
              const inactive = member.accountStatus !== "active";
              const selected = member.documentId === value;
              return (
                <button
                  key={member.documentId}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled || inactive}
                  onClick={() => onChange(member.documentId)}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbe8f]/40 disabled:cursor-not-allowed ${
                    selected
                      ? "border-[#2dbe8f] bg-[#f0fdf8]"
                      : "border-border hover:bg-slate-50 disabled:hover:bg-transparent"
                  }`}
                >
                  <span
                    className={`block text-sm font-semibold ${inactive ? "text-slate-400" : ""}`}
                    style={inactive ? undefined : { color: "#162040" }}
                  >
                    {member.nume}
                  </span>
                  <span className="block text-xs text-muted-foreground">{member.email}</span>
                  {inactive && (
                    <span className="mt-1 block text-xs" style={{ color: "#d97706" }}>
                      Contul nu este încă activat. Transferul este posibil după activare.
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
