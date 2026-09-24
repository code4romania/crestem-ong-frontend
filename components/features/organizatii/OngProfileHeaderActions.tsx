"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { MyOng } from "@/lib/api/ongs";
import { EditOngNivel2Modal } from "./EditOngNivel2Modal";

export function OngProfileHeaderActions({ ong }: { ong: MyOng }) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors"
        style={{ color: "#1c1c81" }}
      >
        <Pencil size={14} />
        Editează
      </button>
      {editing && <EditOngNivel2Modal ong={ong} onClose={() => setEditing(false)} />}
    </>
  );
}
