import { listMentorPrograms } from "@/lib/api/meetings";
import { MentorProgramCard } from "@/components/features/mentor/MentorProgramCard";

export default async function MentorProgramelePage() {
  const { data: programs } = await listMentorPrograms();

  return (
    <div>
      <h1 className="text-2xl font-heading font-extrabold mb-1" style={{ color: "#1c1c81" }}>
        Programele mele
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Cont persoană resursă — Crestem.ONG</p>

      {programs.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Nu ești alocat niciunui program.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {programs.map((program) => (
            <MentorProgramCard key={program.documentId} program={program} />
          ))}
        </div>
      )}
    </div>
  );
}
