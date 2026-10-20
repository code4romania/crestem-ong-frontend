import { getMentorDashboard } from "@/lib/api/dashboard";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { DashboardStatGrid } from "@/components/features/dashboard/DashboardStatGrid";
import { DashboardStatCard } from "@/components/features/dashboard/DashboardStatCard";
import { MissingReportsAlert } from "@/components/features/dashboard-mentor/MissingReportsAlert";
import { NextMeetingBanner } from "@/components/features/dashboard-mentor/NextMeetingBanner";
import { CurrentProgramsCard } from "@/components/features/dashboard-mentor/CurrentProgramsCard";
import { MentoredOngsCard } from "@/components/features/dashboard-mentor/MentoredOngsCard";

export default async function MentorDashboardPage() {
  const { data } = await getMentorDashboard();

  return (
    <div>
      <DashboardHeader
        title="Panou principal"
        subtitle="Bun venit! Iată o privire de ansamblu asupra activității tale ca persoană resursă."
      />

      <DashboardStatGrid>
        <DashboardStatCard
          value={data.meetingsHeld}
          label="Întâlniri desfășurate"
          caption={`din ${data.meetingsTotal} totale`}
        />
        <DashboardStatCard
          value={data.mentoredOngCount}
          label="ONG-uri mentorate"
          caption={
            data.activeProgramCount === 1 ? "în programul curent" : "în programele curente"
          }
          valueTone="violet"
          tone="violet"
        />
        <DashboardStatCard
          value={data.reportsSent}
          label="Rapoarte trimise"
          caption={
            data.reportsMissing === 1
              ? "1 raport lipsă"
              : `${data.reportsMissing} rapoarte lipsă`
          }
          valueTone="orange"
          tone="amber"
        />
        <DashboardStatCard
          value={data.activeProgramCount}
          label="Programe ca mentor"
          caption="programe active"
          valueTone="green"
          tone="teal"
        />
      </DashboardStatGrid>

      <MissingReportsAlert
        meetings={data.missingReports}
        total={data.reportsMissing}
      />

      <NextMeetingBanner meeting={data.nextMeeting} />

      <CurrentProgramsCard programs={data.currentPrograms} />

      <MentoredOngsCard mentoredOngs={data.mentoredOngs} />
    </div>
  );
}
