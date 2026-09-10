import { listLibraryCategories } from "@/lib/api/library-categories";
import { CategoryManager } from "@/components/features/biblioteca/CategoryManager";

export default async function Page() {
  return <CategoryManager categories={await listLibraryCategories()} />;
}
