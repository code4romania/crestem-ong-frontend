import { notFound } from "next/navigation";
import { getPage, listPageOptions } from "@/lib/api/pages";
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

  return <PageForm page={page} pages={await listPageOptions()} />;
}
