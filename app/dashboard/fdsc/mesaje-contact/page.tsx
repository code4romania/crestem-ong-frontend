import { listContactMessages } from "@/lib/api/contact";
import { MesajeContactTable } from "@/components/features/dashboard/MesajeContactTable";
import { UtilizatoriPagination } from "@/components/features/dashboard/UtilizatoriPagination";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

// Layout-ul `/dashboard/fdsc` ține non-staff-ul afară, iar ecranul e deschis
// întregului staff FDSC — spre deosebire de `utilizatori`, care se îngustează
// la super-admin. Deci nicio verificare de rol în plus aici.
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const { data: messages, meta } = await listContactMessages({ page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold" style={{ color: "#162040" }}>
          Mesaje contact
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mesajele trimise din formularul public, cele mai noi primele
        </p>
      </div>

      <MesajeContactTable messages={messages} />

      <UtilizatoriPagination
        pagination={meta.pagination}
        basePath="/dashboard/mesaje-contact"
        label="Paginare mesaje de contact"
      />
    </div>
  );
}
