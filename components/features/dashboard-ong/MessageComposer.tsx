"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function MessageComposer({
  onSend,
  disabled = false,
}: {
  onSend: (content: string) => Promise<boolean>;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const content = value.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const sent = await onSend(content);
      if (sent) setValue("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-border px-4 py-3 flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        disabled={disabled || sending}
        placeholder="Scrie un mesaj..."
        className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] disabled:opacity-50"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || sending || value.trim().length === 0}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:brightness-90"
        style={{ background: "#00d495" }}
      >
        <Send size={14} /> Trimite
      </button>
    </div>
  );
}
