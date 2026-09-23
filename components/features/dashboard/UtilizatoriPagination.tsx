import Link from "next/link";
import type { UsersPagination } from "@/lib/api/users";

export function UtilizatoriPagination({
  pagination,
  search = "",
  role = "",
  ong = "",
  status = "",
  basePath = "/dashboard/utilizatori",
  label = "Paginare utilizatori",
}: {
  pagination: UsersPagination;
  search?: string;
  role?: string;
  ong?: string;
  status?: string;
  /** Ruta paginii care randează componenta — implicit ecranul de utilizatori. */
  basePath?: string;
  /** `aria-label`-ul navigației — implicit cel al ecranului de utilizatori. */
  label?: string;
}) {
  const { page, pageCount } = pagination;
  if (pageCount <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    if (ong) params.set("ong", ong);
    if (status) params.set("status", status);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  }

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav aria-label={label} className="flex items-center justify-center gap-1 mt-6">
      <PageLink href={hrefFor(Math.max(1, page - 1))} disabled={page === 1}>
        Anterior
      </PageLink>
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? "page" : undefined}
          className="px-3 py-2 rounded-lg text-sm border font-medium min-w-[2.5rem] text-center"
          style={
            p === page
              ? { background: "#162040", color: "white", borderColor: "#162040" }
              : { borderColor: "#e2e8f0", color: "#475569" }
          }
        >
          {p}
        </Link>
      ))}
      <PageLink href={hrefFor(Math.min(pageCount, page + 1))} disabled={page === pageCount}>
        Următor
      </PageLink>
    </nav>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  if (disabled) {
    return (
      <span aria-disabled="true" className="px-3 py-2 rounded-lg text-sm border border-border opacity-40" style={{ color: "#94a3b8" }}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className="px-3 py-2 rounded-lg text-sm border border-border hover:bg-slate-50" style={{ color: "#475569" }}>
      {children}
    </Link>
  );
}
