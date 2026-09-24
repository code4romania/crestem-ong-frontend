"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightLeft, ChevronDown, KeyRound, Mail, Plus, Trash2 } from "lucide-react";
import { AddOngRequestModal } from "./AddOngRequestModal";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { ChangeEmailModal } from "./ChangeEmailModal";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { DeleteOwnOngDialog } from "../organizatii/DeleteOwnOngDialog";
import { TransferOngDialog } from "../organizatii/TransferOngDialog";
import type { TransferCandidate } from "@/lib/api/admin-transfer";

export function ProfileActionsMenu({
  showAddOng = true,
  showChangeEmail = true,
  deleteOng,
  transferOng,
}: {
  showAddOng?: boolean;
  /**
   * Off for the Admin ONG, whose role is deliberately not granted
   * `api::auth.auth.requestEmailChange` — offering the item would only 403.
   */
  showChangeEmail?: boolean;
  /**
   * The Admin ONG's own organization. Present only on the ONG profile, where
   * "Business rules.txt" puts `Șterge ONG` in this menu. The backend still
   * refuses any organization the caller does not belong to.
   */
  deleteOng?: { documentId: string; name: string };
  /**
   * „Transferă organizația” (US-1 AC1): only the Admin ONG's profile passes
   * it. Disabled while a transfer is pending — one at a time (US-1 A2).
   */
  transferOng?: { ongName: string; members: TransferCandidate[]; pending: boolean };
} = {}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingOng, setDeletingOng] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors"
        style={{ color: "#1c1c81" }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Acțiuni
        <ChevronDown size={16} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-border shadow-lg py-1.5 z-10"
        >
          {showAddOng && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setAdding(true);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors"
              style={{ color: "#1c1c81" }}
            >
              <Plus size={16} style={{ color: "#007d58" }} />
              Adaugă ONG
            </button>
          )}
          {showAddOng && <div className="my-1.5 border-t border-border" />}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setChangingPassword(true);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors"
            style={{ color: "#1c1c81" }}
          >
            <KeyRound size={16} style={{ color: "#007d58" }} />
            Schimbă parola
          </button>
          {showChangeEmail && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setChangingEmail(true);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors"
              style={{ color: "#1c1c81" }}
            >
              <Mail size={16} style={{ color: "#007d58" }} />
              Schimbă adresa de mail
            </button>
          )}
          <div className="my-1.5 border-t border-border" />
          {/* Above "Șterge contul" on purpose: BR-32 refuses to delete an
              ngo-admin's account until the organization is gone, so this is the
              step they have to take first. */}
          {transferOng && (
            <>
              <button
                type="button"
                role="menuitem"
                disabled={transferOng.pending}
                title={
                  transferOng.pending
                    ? "Există deja un transfer în așteptare. Anulează-l înainte de a iniția unul nou."
                    : undefined
                }
                onClick={() => {
                  setOpen(false);
                  setTransferring(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                style={{ color: "#1c1c81" }}
              >
                <ArrowRightLeft size={16} style={{ color: "#007d58" }} />
                Transferă organizația
              </button>
              <div className="my-1.5 border-t border-border" />
            </>
          )}
          {deleteOng && (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  setDeletingOng(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors text-[#dc2626]"
              >
                <Trash2 size={16} />
                Șterge ONG
              </button>
              <div className="my-1.5 border-t border-border" />
            </>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setDeleting(true);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors text-[#dc2626]"
          >
            <Trash2 size={16} />
            Șterge contul
          </button>
        </div>
      )}

      {showAddOng && adding && <AddOngRequestModal onClose={() => setAdding(false)} />}
      {changingPassword && <ChangePasswordModal onClose={() => setChangingPassword(false)} />}
      {showChangeEmail && changingEmail && (
        <ChangeEmailModal onClose={() => setChangingEmail(false)} />
      )}
      {/* Mounted outside the dropdown so closing the menu does not unmount the
          dialog mid-deletion. */}
      {deleteOng && deletingOng && (
        <DeleteOwnOngDialog
          documentId={deleteOng.documentId}
          ongName={deleteOng.name}
          onClose={() => setDeletingOng(false)}
        />
      )}
      {transferOng && transferring && (
        <TransferOngDialog
          mode="ngo-admin"
          ongName={transferOng.ongName}
          members={transferOng.members}
          onClose={() => setTransferring(false)}
        />
      )}
      {deleting && <DeleteAccountModal onClose={() => setDeleting(false)} />}
    </div>
  );
}
