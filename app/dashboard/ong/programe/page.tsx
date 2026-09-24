import { serverApiFetch } from "@/lib/api/server";
import { getIndependentStartLock, groupFdscReportsByProgram } from "@/lib/api/reports";
import type { ReportsCurrent, OngMember, MyFdscReport } from "@/lib/api/reports";
import type { AssignedMentor } from "@/lib/api/programs";
import { ProgramRoundsSection, type ProgramRoundWithDetail } from "@/components/features/dashboard-ong/ProgramRoundsSection";
import { StartIndependentEvaluationButton } from "@/components/features/dashboard-ong/StartIndependentEvaluationButton";

export default async function OngProgramePage() {
  const [currentRes, membersRes, fdscReportsRes] = await Promise.all([
    serverApiFetch<{ data: ReportsCurrent }>("/api/reports/current"),
    serverApiFetch<{ data: OngMember[] }>("/api/ongs/members"),
    serverApiFetch<{ data: MyFdscReport[] }>("/api/reports/fdsc-reports"),
  ]);

  const fdscReportsByProgram = groupFdscReportsByProgram(fdscReportsRes.data);

  const programRounds: ProgramRoundWithDetail[] = await Promise.all(
    currentRes.data.programRounds.map(async ({ program, phases }) => {
      const mentorsRes = await serverApiFetch<{ data: AssignedMentor[] }>(
        `/api/programs/${encodeURIComponent(program.documentId)}/mentors`,
      );
      return {
        program,
        mentors: mentorsRes.data,
        phases: phases.map((phase) => ({ ...phase, score: phase.report?.score ?? null })),
        fdscReports: fdscReportsByProgram.get(program.documentId) ?? [],
      };
    }),
  );

  const independentLock = getIndependentStartLock(currentRes.data.programRounds, currentRes.data.standaloneReports);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#1c1c81" }}>
          Programele mele
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vezi toate programele ONG-ului tău
        </p>
      </div>

      <div className="mb-6">
        <StartIndependentEvaluationButton
          ongMembers={membersRes.data}
          lock={independentLock}
          showActivePhaseHint={false}
        />
      </div>

      <ProgramRoundsSection
        programRounds={programRounds}
        standaloneReports={currentRes.data.standaloneReports}
        ongMembers={membersRes.data}
      />
    </div>
  );
}
