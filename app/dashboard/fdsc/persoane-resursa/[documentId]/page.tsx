import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUser } from "@/lib/api/users";
import { listDimensions } from "@/lib/api/dimensions";
import { PersoanaResursaDetail } from "@/components/features/dashboard/PersoanaResursaDetail";

export default async function PersoanaResursaPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [{ data: mentor }, dimensions] = await Promise.all([
    getUser(documentId),
    listDimensions(),
  ]);

  return (
    <div>
      <Link
        href="/dashboard/persoane-resursa"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6"
        style={{ color: "#5b6779" }}
      >
        <ArrowLeft size={14} /> Înapoi la persoane resursă
      </Link>

      <PersoanaResursaDetail mentor={mentor} dimensions={dimensions} />
    </div>
  );
}
