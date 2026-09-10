import { notFound } from "next/navigation";
import { getPage, listPageOptions } from "@/lib/api/pages";
import { listLibraryCategories } from "@/lib/api/library-categories";
import { PageForm } from "@/components/features/pages/PageForm";

export default async function Page({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  let page;
  try {
    page = await getPage(documentId);
  } catch {
    notFound();
  }

  const [pages, categories] = await Promise.all([
    listPageOptions(),
    listLibraryCategories(),
  ]);

  return (
    <PageForm page={page} pages={pages} categories={categories} />
  );
}
