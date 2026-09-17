import { listArticles } from "@/lib/api/articles";
import { listLibraryCategories } from "@/lib/api/library-categories";
import { ArticleList } from "@/components/features/biblioteca/ArticleList";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    categorie?: string;
    subcategorie?: string;
    vizibilitate?: string;
    page?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const categorie = params.categorie ?? "";
  const subcategorie = params.subcategorie ?? "";
  const vizibilitate = params.vizibilitate ?? "";

  const [articles, categories] = await Promise.all([
    listArticles({ search, categorie, subcategorie, vizibilitate, page: Number(params.page) || 1 }),
    listLibraryCategories(),
  ]);

  return (
    <ArticleList
      articles={articles.data}
      search={search}
      categorie={categorie}
      subcategorie={subcategorie}
      vizibilitate={vizibilitate}
      categories={categories}
      pagination={articles.meta.pagination}
      canCreate={categories.some((category) => category.copii.length > 0)}
    />
  );
}
