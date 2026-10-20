import { Construction } from "lucide-react";

export function UnimplementedPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-heading font-extrabold mb-6" style={{ color: "#1c1c81" }}>
        {title}
      </h1>
      <div className="bg-white rounded-xl border border-border p-12 flex flex-col items-center text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{ background: "#e5f9e5" }}
        >
          <Construction size={22} style={{ color: "#007d58" }} />
        </div>
        <p className="font-heading font-bold text-lg mb-2" style={{ color: "#1c1c81" }}>
          Pagina nu a fost implementată încă
        </p>
        <p className="text-sm text-muted-foreground max-w-sm">Lucrăm la ea. Revino mai târziu.</p>
      </div>
    </div>
  );
}
