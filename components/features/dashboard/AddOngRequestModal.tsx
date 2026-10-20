"use client";

import { toast } from "sonner";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, Check, Loader2, Search, X } from "lucide-react";
import { requestJoinOngAction, searchJoinableOngsAction } from "@/lib/api/membership-actions";
import type { JoinableOng } from "@/lib/api/membership";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

/** Mirrors the 1000-char cap applied by the backend in `createJoinRequest`. */
const MESSAGE_MAX_LENGTH = 1000;

export function AddOngRequestModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JoinableOng[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<JoinableOng | null>(null);
  const [message, setMessage] = useState("");
  const [isSearchPending, startSearchTransition] = useTransition();
  const [isSendPending, startSendTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startSearchTransition(async () => {
        const result = await searchJoinableOngsAction(query);
        if (result.error) {
          setSearchError(result.error);
          setResults([]);
        } else {
          setSearchError(null);
          setResults(result.data ?? []);
        }
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, startSearchTransition]);

  const handleSelect = (ong: JoinableOng) => {
    if (ong.hasPendingRequest || sentIds.has(ong.documentId)) return;
    setSearchError(null);
    setMessage("");
    setSelected(ong);
  };

  const handleBack = () => {
    setSearchError(null);
    setMessage("");
    setSelected(null);
  };

  const handleSendRequest = () => {
    if (!selected) return;
    const ongDocumentId = selected.documentId;
    const trimmed = message.trim();
    startSendTransition(async () => {
      const result = await requestJoinOngAction(ongDocumentId, trimmed || undefined);
      if (result.error) {
        setSearchError(result.error);
        return;
      }
      toast.success("Cererea de afiliere a fost trimisă.");
      setSentIds((prev) => new Set(prev).add(ongDocumentId));
      setMessage("");
      setSelected(null);
    });
  };

  return (
    <ModalOverlay labelledBy="add-ong-request-title">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <div className="min-w-0">
            {selected && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSendPending}
                className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-60"
              >
                <ArrowLeft size={14} />
                Înapoi
              </button>
            )}
            <h2 id="add-ong-request-title" className="font-heading font-extrabold text-lg" style={{ color: "#1c1c81" }}>
              Adaugă ONG
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {selected
                ? "Adaugă un mesaj pentru administratorul organizației, apoi trimite cererea."
                : "Caută un ONG activ după nume sau CUI/CIF și trimite o cerere de afiliere."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {selected ? (
          <div className="px-6 py-5 space-y-4 overflow-y-auto">
            {searchError && (
              <p role="alert" className="rounded-lg px-3 py-2 text-sm bg-[#fff5f5] border-[1.5px] border-[#fca5a5] text-[#b91c1c]">
                {searchError}
              </p>
            )}

            <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                style={{ background: "#1c1c81" }}
              >
                {selected.name.trim().charAt(0).toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#1c1c81" }}>
                  {selected.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {[selected.cui, selected.domeniu, selected.localitate, `${selected.memberCount} membri`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="join-request-message"
                className="block text-sm font-semibold mb-1.5"
                style={{ color: "#1c1c81" }}
              >
                Mesaj <span className="font-normal text-muted-foreground">(opțional)</span>
              </label>
              <textarea
                id="join-request-message"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
                maxLength={MESSAGE_MAX_LENGTH}
                rows={5}
                disabled={isSendPending}
                placeholder="Spune-le de ce vrei să te alături organizației..."
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors bg-white text-sm resize-y disabled:opacity-60"
              />
              <p className="mt-1 text-xs text-right text-muted-foreground" aria-live="polite">
                {message.length}/{MESSAGE_MAX_LENGTH}
              </p>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4 space-y-3 overflow-y-auto">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută după nume sau CUI/CIF..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors bg-white text-sm"
                autoFocus
              />
            </div>

            {searchError && (
              <p role="alert" className="rounded-lg px-3 py-2 text-sm bg-[#fff5f5] border-[1.5px] border-[#fca5a5] text-[#b91c1c]">
                {searchError}
              </p>
            )}

            {isSearchPending ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Niciun ONG găsit.
              </p>
            ) : (
              results.map((ong) => {
                const sent = ong.hasPendingRequest || sentIds.has(ong.documentId);
                return (
                  <div
                    key={ong.documentId}
                    className="flex items-center justify-between gap-3 border border-border rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                        style={{ background: "#1c1c81" }}
                      >
                        {ong.name.trim().charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#1c1c81" }}>
                          {ong.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {[ong.cui, ong.domeniu, ong.localitate, `${ong.memberCount} membri`]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {sent && (
                          <p className="text-xs font-semibold mt-0.5" style={{ color: "#b45309" }}>
                            Ai deja o cerere în așteptare
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelect(ong)}
                      disabled={sent}
                      className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:brightness-90 transition-opacity disabled:opacity-70"
                      style={{ background: sent ? "#94a3b8" : "#00d495" }}
                    >
                      {sent && <Check size={14} />}
                      {sent ? "Cerere trimisă" : "Continuă"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="px-6 py-4 border-t border-border flex items-center gap-3">
          {selected ? (
            <>
              <button
                type="button"
                onClick={handleBack}
                disabled={isSendPending}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors text-[#475569] disabled:opacity-60"
              >
                Înapoi
              </button>
              <button
                type="button"
                onClick={handleSendRequest}
                disabled={isSendPending}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-90 transition-opacity disabled:opacity-70"
                style={{ background: "#00d495" }}
              >
                {isSendPending && <Loader2 size={14} className="animate-spin" />}
                {isSendPending ? "Se trimite..." : "Trimite cerere"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors text-[#475569]"
            >
              Închide
            </button>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}
