import { getFooter } from "@/lib/api/footer";
import { listMenus } from "@/lib/api/menus";
import { listPageOptions } from "@/lib/api/pages";
import { MenuBuilder } from "@/components/features/menus/MenuBuilder";

export default async function Page() {
  const [menus, footer, pages] = await Promise.all([
    listMenus(),
    getFooter(),
    listPageOptions(),
  ]);

  return <MenuBuilder menus={menus} footer={footer} pages={pages} />;
}
