import { serverApiFetch } from "@/lib/api/server";
import { listOngMeetings } from "@/lib/api/meetings";
import type { Ong, MyOng, OngMentor } from "@/lib/api/ongs";
import { listDimensions } from "@/lib/api/dimensions";
import { pickNextMeeting } from "@/lib/utils/meetings";
import { PersoaneResursaTabs } from "@/components/features/dashboard-ong/PersoaneResursaTabs";
import { MeetingsFilters } from "@/components/features/organizatii/MeetingsFilters";
import { MeetingsTable } from "@/components/features/organizatii/MeetingsTable";
import { NextMeetingBanner } from "@/components/features/organizatii/NextMeetingBanner";

type QueryValue = string | string[] | undefined;

interface PageProps {
  searchParams: Promise<{ mentor?: QueryValue; program?: QueryValue; status?: QueryValue; format?: QueryValue }>;
}

function firstQueryValue(value: QueryValue): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function OngPersoaneResursaIntalniriPage({ searchParams }: PageProps) {
  const searchParamsResolved = await searchParams;
  const mentorFilter = firstQueryValue(searchParamsResolved.mentor);
  const programFilter = firstQueryValue(searchParamsResolved.program);
  const statusFilter = firstQueryValue(searchParamsResolved.status);
  const formatFilter = firstQueryValue(searchParamsResolved.format);

  const { data: myOng } = await serverApiFetch<{ data: MyOng }>("/api/ongs/me");

  const [ongRes, mentorsRes, meetingsRes, { data: upcomingMeetings }, dimensions] = await Promise.all([
    serverApiFetch<{ data: Ong }>(`/api/ongs/${myOng.documentId}`),
    serverApiFetch<{ data: OngMentor[] }>(`/api/ongs/${myOng.documentId}/mentors`),
    listOngMeetings(myOng.documentId, {
      mentor: mentorFilter,
      program: programFilter,
      status: statusFilter,
      format: formatFilter,
    }),
    listOngMeetings(myOng.documentId, { status: "programata" }),
    listDimensions(),
  ]);

  const ong = ongRes.data;
  const mentors = mentorsRes.data;
  const nextMeeting = pickNextMeeting(upcomingMeetings);

  return (
    <div>
      <PersoaneResursaTabs active="intalniri" />

      <h1 className="text-2xl font-heading font-extrabold mb-4" style={{ color: "#1c1c81" }}>
        Toate întâlnirile
      </h1>

      {nextMeeting && (
        <NextMeetingBanner meeting={nextMeeting} primaryLabel={nextMeeting.mentor?.nume ?? "—"} />
      )}

      <MeetingsFilters
        mentors={mentors}
        programs={ong.programs}
        initialMentor={mentorFilter}
        initialProgram={programFilter}
        initialStatus={statusFilter}
        initialFormat={formatFilter}
      />

      <MeetingsTable meetings={meetingsRes.data} ongName={ong.name} dimensions={dimensions} />
    </div>
  );
}
