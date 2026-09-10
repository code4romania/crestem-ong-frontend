import { listPageOptions } from "@/lib/api/pages";
import { listLibraryCategories } from "@/lib/api/library-categories";
import { PageForm } from "@/components/features/pages/PageForm";

export default async function Page() {
  const [pages, categories] = await Promise.all([
    listPageOptions(),
    listLibraryCategories(),
  ]);

  return (
    <PageForm page={null} pages={pages} categories={categories} />
  );
}
