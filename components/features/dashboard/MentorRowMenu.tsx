"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Download, EllipsisVertical, Loader2, Mail, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { userDisplayName } from "@/lib/api/auth";
import type { AdminUser } from "@/lib/api/users";
import { resendMentorInviteAction } from "@/lib/api/users-actions";
import { useFileDownload } from "@/components/ui/DownloadButton";
import { AdminChangeEmailModal } from "./AdminChangeEmailModal";
import { DeleteMentorDialog } from "./DeleteMentorButton";
import { mentorAdminActions } from "./mentor-admin-actions";

const MENU_WIDTH = 224; // w-56
const GAP = 4;

const itemClass =
  "w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 focus:bg-slate-50 focus:outline-none transition-colors";

const NO_ADMIN_ACTIONS = { resend: false, changeEmail: false, remove: false };

/**
 * The kebab menu on a "persoană resursă" row. The editor only gets the
 * download; the account actions are the super-admin's.
 */
export function MentorRowMenu({
  user,
  canManage,
}: {
  user: AdminUser;
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isResending, startResend] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { busy: downloading, download } = useFileDownload(
    `/api/admin/meetings/export?mentor=${encodeURIComponent(user.documentId)}`,
  );
  const actions = canManage ? mentorAdminActions(user.accountStatus) : NO_ADMIN_ACTIONS;
  const nume = userDisplayName(user);
  const busy = downloading || isResending;

  const close = (refocus = false) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    // The menu is fixed to the viewport, so it would drift away from its row.
    const handleMove = () => setOpen(false);
    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("scroll", handleMove, true);
    window.addEventListener("resize", handleMove);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("scroll", handleMove, true);
      window.removeEventListener("resize", handleMove);
    };
  }, [open]);

  // Portalled to <body> and fixed: the table's overflow would clip it, and a
  // deleted account's faded row would fade it too. Flipped above the trigger
  // when there is no room below. Placed straight on the node before paint, so
  // it never shows at the wrong spot.
  const placeMenu = (node: HTMLDivElement | null) => {
    menuRef.current = node;
    if (!node || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const height = node.offsetHeight;
    const fitsBelow = rect.bottom + GAP + height <= window.innerHeight;
    node.style.top = `${fitsBelow ? rect.bottom + GAP : Math.max(GAP, rect.top - GAP - height)}px`;
    node.style.left = `${Math.max(GAP, rect.right - MENU_WIDTH)}px`;
    node.style.visibility = "visible";
    node.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Tab too: the items unmount with the menu, which would drop focus.
    if (e.key === "Escape" || e.key === "Tab") {
      e.preventDefault();
      close(true);
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    const current = items.indexOf(document.activeElement as HTMLElement);
    const step = e.key === "ArrowDown" ? 1 : -1;
    items[(current + step + items.length) % items.length]?.focus();
  };

  const handleResend = () => {
    close();
    startResend(async () => {
      const result = await resendMentorInviteAction(user.documentId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Invitația a fost retrimisă.");
      router.refresh();
    });
  };

  return (
    // The row navigates on click; nothing in here — menu or dialogs, which
    // still bubble through the React tree — may trigger it.
    <div className="inline-flex" onClick={(e) => e.stopPropagation()}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Acțiuni pentru ${nume}`}
        title="Acțiuni"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1c81]/40"
        style={{ color: "#475569" }}
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin" aria-hidden />
        ) : (
          <EllipsisVertical size={16} aria-hidden />
        )}
      </button>

      {open && createPortal(
        <div
          ref={placeMenu}
          role="menu"
          aria-label={`Acțiuni pentru ${nume}`}
          onKeyDown={handleMenuKeyDown}
          className="fixed w-56 bg-white rounded-xl border border-border shadow-lg py-1.5 z-50 text-left"
          style={{ top: 0, left: 0, visibility: "hidden" }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              void download();
            }}
            className={itemClass}
            style={{ color: "#1c1c81" }}
          >
            <Download size={16} style={{ color: "#007d58" }} />
            Descarcă jurnalul
          </button>
          {actions.resend && (
            <button
              type="button"
              role="menuitem"
              onClick={handleResend}
              className={itemClass}
              style={{ color: "#1c1c81" }}
            >
              <Send size={16} style={{ color: "#007d58" }} />
              Retrimite invitația
            </button>
          )}
          {actions.changeEmail && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                setChangingEmail(true);
              }}
              className={itemClass}
              style={{ color: "#1c1c81" }}
            >
              <Mail size={16} style={{ color: "#007d58" }} />
              Schimbă emailul
            </button>
          )}
          {actions.remove && user.accountStatus !== "deleted" && (
            <>
              <div className="my-1.5 border-t border-border" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  setDeleting(true);
                }}
                className={`${itemClass} text-[#dc2626]`}
              >
                <Trash2 size={16} />
                Șterge
              </button>
            </>
          )}
        </div>,
        document.body,
      )}

      {/* Mounted outside the menu so closing it does not unmount them. */}
      {changingEmail && (
        <AdminChangeEmailModal user={user} onClose={() => setChangingEmail(false)} />
      )}
      {user.accountStatus !== "deleted" && (
        <DeleteMentorDialog
          documentId={user.documentId}
          nume={nume}
          accountStatus={user.accountStatus}
          open={deleting}
          onClose={() => setDeleting(false)}
        />
      )}
    </div>
  );
}
