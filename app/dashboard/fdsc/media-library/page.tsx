import { listMediaAssets, listMediaTags } from "@/lib/api/media-library";
import { MediaLibrary } from "@/components/features/media-library/MediaLibrary";

interface PageProps {
  searchParams: Promise<{ search?: string; tip?: string; etichete?: string; page?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = {
    search: params.search ?? "",
    tip: params.tip ?? "",
    etichete: params.etichete ? params.etichete.split(",").filter(Boolean) : [],
    page: Number(params.page) || 1,
  };
  const [assets, tags] = await Promise.all([
    listMediaAssets(query),
    listMediaTags(),
  ]);

  return <MediaLibrary initial={assets} tags={tags} query={query} />;
}
