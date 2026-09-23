"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "programata", label: "Programată" },
  { value: "efectuata", label: "Efectuată" },
  { value: "anulata", label: "Anulată" },
];

const FORMAT_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "fata_in_fata", label: "Față în față" },
];

interface MentorOption {
  documentId: string;
  nume: string;
}

interface ProgramOption {
  documentId: string;
  name: string;
}

export function MeetingsFilters({
  mentors,
  programs,
  initialMentor,
  initialProgram,
  initialStatus,
  initialFormat,
}: {
  mentors: MentorOption[];
  programs: ProgramOption[];
  initialMentor: string;
  initialProgram: string;
  initialStatus: string;
  initialFormat: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(
    key: "mentor" | "program" | "status" | "format",
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
        <label htmlFor="meetings-mentor" className="sr-only">
          Filtrează după persoană resursă
        </label>
        <select
          id="meetings-mentor"
          defaultValue={initialMentor}
          onChange={(e) => navigate("mentor", e.target.value)}
          className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-full border border-border text-sm bg-white sm:w-auto"
        >
          <option value="">Toate persoanele resursă</option>
          {mentors.map((mentor) => (
            <option key={mentor.documentId} value={mentor.documentId}>
              {mentor.nume}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
      <div className="relative w-full sm:w-auto">
        <label htmlFor="meetings-program" className="sr-only">
          Filtrează după program
        </label>
        <select
          id="meetings-program"
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
        <label htmlFor="meetings-status" className="sr-only">
          Filtrează după status
        </label>
        <select
          id="meetings-status"
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
        <label htmlFor="meetings-format" className="sr-only">
          Filtrează după format
        </label>
        <select
          id="meetings-format"
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
