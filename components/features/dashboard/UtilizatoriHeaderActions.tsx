"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddFdscUserModal } from "./AddFdscUserModal";
import type { Dimension } from "@/lib/api/dimensions";

export function UtilizatoriHeaderActions({ dimensions }: { dimensions: Dimension[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        style={{ background: "#5656e5" }}
      >
        <Plus size={16} />
        Adaugă utilizator
      </button>
      {adding && <AddFdscUserModal dimensions={dimensions} onClose={() => setAdding(false)} />}
    </>
  );
}
