import { serverApiFetch } from "@/lib/api/server";
import type { OngListResult } from "@/lib/api/ongs";
import type { Program } from "@/lib/api/programs";
import { OrganizatiiGrid } from "@/components/features/organizatii/OrganizatiiGrid";

export default async function OrganizatiiPage() {
  // Only the first twenty: the grid asks for the pages after this one itself,
  // as it scrolls.
  const [{ data: ongs, meta }, { data: programs }] = await Promise.all([
    serverApiFetch<OngListResult>("/api/ongs"),
    serverApiFetch<{ data: Program[] }>("/api/programs"),
  ]);
  return <OrganizatiiGrid initialOngs={ongs} initialMeta={meta} programs={programs} />;
}
