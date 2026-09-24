import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import type { Dimension } from "@/lib/api/dimensions";
import { MatrixModelView } from "@/components/features/overview/MatrixModelView";

export default async function OngMatrixModelPage() {
  const dimensions = await serverApiFetch<Dimension[]>("/api/dimensions");
  const questionCount = dimensions.reduce((total, dimension) => total + dimension.quiz.length, 0);

  return (
    <div>
      <Link
        href="/dashboard/evaluari"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6"
        style={{ color: "#5b6779" }}
      >
        <ArrowLeft size={14} /> Înapoi la evaluări
      </Link>

      <h1 className="text-2xl font-heading font-extrabold mb-2" style={{ color: "#1c1c81" }}>
        Modelul matricei de dezvoltare organizațională
      </h1>
      <p className="text-sm mb-6" style={{ color: "#5b6779" }}>
        {dimensions.length} {dimensions.length === 1 ? "dimensiune" : "dimensiuni"} · {questionCount}{" "}
        {questionCount === 1 ? "întrebare" : "întrebări"} · 5 niveluri
      </p>

      <MatrixModelView dimensions={dimensions} />
    </div>
  );
}
