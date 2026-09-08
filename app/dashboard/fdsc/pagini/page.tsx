import { listPages } from "@/lib/api/pages";
import { PageList } from "@/components/features/pages/PageList";

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const { data, meta } = await listPages({ search, page: Number(params.page) || 1 });

  return <PageList pages={data} search={search} pagination={meta.pagination} />;
}
