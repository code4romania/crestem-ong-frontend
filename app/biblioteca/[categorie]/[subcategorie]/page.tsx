import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ categorie: string; subcategorie: string }>;
}) {
  const { categorie, subcategorie } = await params;

  redirect(`/biblioteca/${categorie}?subcategorie=${encodeURIComponent(subcategorie)}`);
}
