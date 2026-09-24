"use client";

import { useState } from "react";
import type { ContactMessage } from "@/lib/api/contact-types";
import { formatDate } from "@/lib/utils/date";
import { ContactStatusSelect } from "./ContactStatusSelect";
import { MesajContactModal } from "./MesajContactModal";

export function MesajeContactTable({ messages }: { messages: ContactMessage[] }) {
  // Doar id-ul e ținut în state; mesajul se derivă din `messages` la fiecare
  // randare, ca un re-render (după actualizare de status sau ștergere) să
  // ajungă la modal cu date proaspete, nu cu un instantaneu vechi.
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? (messages.find((message) => message.documentId === openId) ?? null) : null;

  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center">
        <p className="text-sm text-muted-foreground">Niciun mesaj deocamdată.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Dată", "Nume", "Email", "Subiect", "Status"].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#5b6779" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr
                key={message.documentId}
                onClick={() => setOpenId(message.documentId)}
                className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-4 py-3.5 text-muted-foreground">
                  {formatDate(message.createdAt)}
                </td>
                <td className="px-4 py-3.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenId(message.documentId);
                    }}
                    className="font-semibold text-[#1c1c81] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007d58] rounded"
                  >
                    {message.name}
                  </button>
                </td>
                <td className="px-4 py-3.5 text-muted-foreground">{message.email}</td>
                <td className="px-4 py-3.5">{message.subject}</td>
                <td className="px-4 py-3.5">
                  <ContactStatusSelect
                    documentId={message.documentId}
                    status={message.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MesajContactModal message={open} onClose={() => setOpenId(null)} />
    </>
  );
}
