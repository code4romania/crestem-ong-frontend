"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { MentorOng } from "@/lib/api/meetings";

const STATUS_OPTIONS = [
  { value: "programata", label: "Programată" },
  { value: "efectuata", label: "Efectuată" },
  { value: "anulata", label: "Anulată" },
];

const FORMAT_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "fata_in_fata", label: "Față în față" },
];

export function MentorMeetingsFilters({
  ongs,
  initialOng,
  initialProgram,
  initialStatus,
  initialFormat,
}: {
  ongs: MentorOng[];
  initialOng: string;
  initialProgram: string;
  initialStatus: string;
  initialFormat: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const programs = Array.from(
    new Map(
      ongs
        .flatMap((ong) => ong.programs)
        .map((program) => [program.documentId, program]),
    ).values(),
  );

  function navigate(
    key: "ong" | "program" | "status" | "format",
    value: string,
  ) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative w-full sm:w-auto">
        <label htmlFor="mentor-meetings-ong" className="sr-only">
          Filtrează după ONG
        </label>
        <select
          id="mentor-meetings-ong"
          defaultValue={initialOng}
          onChange={(e) => navigate("ong", e.target.value)}
          className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-full border border-border text-sm bg-white sm:w-auto"
        >
          <option value="">Toate organizațiile</option>
          {ongs.map((ong) => (
            <option key={ong.documentId} value={ong.documentId}>
              {ong.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
      <div className="relative w-full sm:w-auto">
        <label htmlFor="mentor-meetings-program" className="sr-only">
          Filtrează după program
        </label>
        <select
          id="mentor-meetings-program"
          defaultValue={initialProgram}
          onChange={(e) => navigate("program", e.target.value)}
          className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-full border border-border text-sm bg-white sm:w-auto"
        >
          <option value="">Toate programele</option>
          {programs.map((program) => (
            <option key={program.documentId} value={program.documentId}>
              {program.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
      <div className="relative w-full sm:w-auto">
        <label htmlFor="mentor-meetings-status" className="sr-only">
          Filtrează după status
        </label>
        <select
          id="mentor-meetings-status"
          defaultValue={initialStatus}
          onChange={(e) => navigate("status", e.target.value)}
          className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-full border border-border text-sm bg-white sm:w-auto"
        >
          <option value="">Toate statusurile</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
      <div className="relative w-full sm:w-auto">
        <label htmlFor="mentor-meetings-format" className="sr-only">
          Filtrează după format
        </label>
        <select
          id="mentor-meetings-format"
          defaultValue={initialFormat}
          onChange={(e) => navigate("format", e.target.value)}
          className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-full border border-border text-sm bg-white sm:w-auto"
        >
          <option value="">Toate formatele</option>
          {FORMAT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    </div>
  );
}
