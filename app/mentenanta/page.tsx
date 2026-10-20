import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Revenim în curând | Creștem ONG",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <section className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="maintenance-blob absolute -left-24 -top-24 size-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="maintenance-blob maintenance-blob-alt absolute -bottom-32 -right-24 size-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="maintenance-blob absolute left-1/2 top-1/3 size-72 rounded-full bg-secondary blur-3xl" />
      </div>

      <div className="maintenance-stagger max-w-xl text-center">
        <div className="relative mx-auto mb-10 flex size-56 items-center justify-center">
          <div
            aria-hidden
            className="maintenance-orbit absolute inset-0 rounded-full border-2 border-accent/15 border-t-accent"
          >
            <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
          </div>
          <div
            aria-hidden
            className="maintenance-orbit maintenance-orbit-reverse absolute inset-6 rounded-full border-2 border-primary/10 border-b-primary"
          >
            <span className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary" />
          </div>
          <Logo height={48} />
        </div>
        <h1 className="mb-6 font-heading text-3xl font-extrabold text-primary">
          Revenim în curând
        </h1>
        <div className="space-y-6 text-pretty leading-relaxed text-muted-foreground">
          <p>
            Am lucrat de zor la o versiune nouă și îmbunătățită a platformei
            Creștem ONG, care va fi disponibilă în scurt timp.
          </p>
          <p className="font-medium text-primary">
            În acest moment facem actualizarea website-ului, iar platforma este
            temporar indisponibilă. Cât timp este actualizat website-ul, nu va
            fi posibilă vizualizarea resurselor, accesarea conturilor existente
            sau crearea unor conturi noi.
          </p>
          <p>
            Îți mulțumim pentru răbdare și înțelegere. Revenim online cât mai
            curând!
          </p>
        </div>
      </div>
    </section>
  );
}
