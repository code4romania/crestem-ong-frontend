"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Dimension } from "@/lib/api/dimensions";
import type { MentorOng } from "@/lib/api/meetings";
import { MentorMeetingFormModal } from "./MentorMeetingFormModal";

export function AddMentorMeetingModal({
  ongs,
  dimensions,
}: {
  ongs: MentorOng[];
  dimensions: Dimension[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:brightness-90"
        style={{ background: "#00d495" }}
      >
        <Plus size={14} /> Adaugă întâlnire
      </button>

      <MentorMeetingFormModal
        open={open}
        onClose={() => setOpen(false)}
        ongs={ongs}
        dimensions={dimensions}
      />
    </>
  );
}
