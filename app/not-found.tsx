import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="mb-3 font-heading font-extrabold" style={{ fontSize: "3.5rem", color: "#1c1c81" }}>
          404
        </p>
        <h1 className="mb-3 font-heading font-bold text-xl text-foreground">
          Această pagină nu a fost găsită
        </h1>
        <p className="mb-8 text-muted-foreground">
          Ne pare rău, pagina pe care o cauți nu există. Întoarce-te la pagina principală.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:brightness-90"
          style={{ background: "#00d495" }}
        >
          <ArrowLeft size={18} />
          Înapoi la pagina principală
        </Link>
      </div>
    </section>
  );
}
