import { listPageOptions } from "@/lib/api/pages";
import { PageForm } from "@/components/features/pages/PageForm";

export default async function Page() {
  return <PageForm page={null} pages={await listPageOptions()} />;
}
