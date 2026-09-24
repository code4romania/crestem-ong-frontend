import { listMentorMeetings, listMentorOngs } from "@/lib/api/meetings";
import { listDimensions } from "@/lib/api/dimensions";
import { pickNextMeeting } from "@/lib/utils/meetings";
import { MentorMeetingsFilters } from "@/components/features/mentor/MentorMeetingsFilters";
import { MentorMeetingsTable } from "@/components/features/mentor/MentorMeetingsTable";
import { AddMentorMeetingModal } from "@/components/features/mentor/AddMentorMeetingModal";
import { NextMeetingBanner } from "@/components/features/organizatii/NextMeetingBanner";

type QueryValue = string | string[] | undefined;

interface PageProps {
  searchParams: Promise<{ ong?: QueryValue; program?: QueryValue; status?: QueryValue; format?: QueryValue }>;
}

function firstQueryValue(value: QueryValue): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function MentorIntalniriPage({ searchParams }: PageProps) {
  const searchParamsResolved = await searchParams;
  const ongFilter = firstQueryValue(searchParamsResolved.ong);
  const programFilter = firstQueryValue(searchParamsResolved.program);
  const statusFilter = firstQueryValue(searchParamsResolved.status);
  const formatFilter = firstQueryValue(searchParamsResolved.format);

  const [{ data: ongs }, { data: meetings }, { data: upcomingMeetings }, dimensions] =
    await Promise.all([
      listMentorOngs(),
      listMentorMeetings({
        ong: ongFilter,
        program: programFilter,
        status: statusFilter,
        format: formatFilter,
      }),
      listMentorMeetings({ status: "programata" }),
      listDimensions(),
    ]);

  const nextMeeting = pickNextMeeting(upcomingMeetings);

  return (
    <div>
      <h1 className="text-2xl font-heading font-extrabold mb-1" style={{ color: "#1c1c81" }}>
        Întâlniri
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Cont persoană resursă</p>

      {nextMeeting && <NextMeetingBanner meeting={nextMeeting} primaryLabel={nextMeeting.ong?.name ?? "—"} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="font-heading font-bold text-lg" style={{ color: "#1c1c81" }}>
          Toate întâlnirile
        </h2>
        <AddMentorMeetingModal ongs={ongs} dimensions={dimensions} />
      </div>

      <MentorMeetingsFilters
        ongs={ongs}
        initialOng={ongFilter}
        initialProgram={programFilter}
        initialStatus={statusFilter}
        initialFormat={formatFilter}
      />

      <MentorMeetingsTable meetings={meetings} dimensions={dimensions} ongs={ongs} />
    </div>
  );
}
