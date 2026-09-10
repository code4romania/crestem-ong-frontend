import { listArticles } from "@/lib/api/articles";
import { listLibraryCategories } from "@/lib/api/library-categories";
import { ArticleList } from "@/components/features/biblioteca/ArticleList";

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search ?? "";

  const [articles, categories] = await Promise.all([
    listArticles({ search, page: Number(params.page) || 1 }),
    listLibraryCategories(),
  ]);

  return (
    <ArticleList
      articles={articles.data}
      search={search}
      pagination={articles.meta.pagination}
      canCreate={categories.some((category) => category.copii.length > 0)}
    />
  );
}
