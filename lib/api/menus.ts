import { serverApiFetch } from "./server";

export const MENU_LOCATIONS = ["header", "footer"] as const;

export type MenuLocation = (typeof MENU_LOCATIONS)[number];

export interface MenuChild {
  label: string;
  /**
   * Resolved server-side. Absent on a footer column heading, which is not a
   * link, and also on an item whose linked page was deleted — the editor shows
   * that as broken, the public renderer skips it.
   */
  url?: string;
  /** documentId of the CMS page this item points at, when it points at one. */
  pagina?: string;
}

export interface MenuItem extends MenuChild {
  children: MenuChild[];
}

export interface Menu {
  documentId: string;
  location: MenuLocation;
  name: string;
  items: MenuItem[];
}

/** Both menus, ordered header first — the order the editor's list shows them in. */
export async function listMenus(): Promise<Menu[]> {
  const { data } = await serverApiFetch<{ data: Menu[] }>("/api/menus");
  return data;
}
