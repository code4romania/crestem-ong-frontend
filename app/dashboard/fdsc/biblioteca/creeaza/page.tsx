import { listArticleOptions } from "@/lib/api/articles";
import { listLibraryCategories } from "@/lib/api/library-categories";
import { listPageOptions } from "@/lib/api/pages";
import { ArticleForm } from "@/components/features/biblioteca/ArticleForm";

export default async function Page() {
  // `listArticleOptions` is the tag-suggestion source: it carries `etichete` and
  // is unpaginated, so the suggestion vocabulary now covers the whole library
  // rather than the 20 most recently edited articles `listArticles` returned.
  // `listPageOptions` is what lets a button inside an article point at a CMS page.
  const [categories, articles, pages] = await Promise.all([
    listLibraryCategories(),
    listArticleOptions(),
    listPageOptions(),
  ]);

  /** Tags already in use, offered as suggestions so the vocabulary stays consistent. */
  const suggestions = [...new Set(articles.flatMap((entry) => entry.etichete))].sort();

  return (
    <ArticleForm
      article={null}
      categories={categories}
      tagSuggestions={suggestions}
     
      pages={pages}
    />
  );
}
