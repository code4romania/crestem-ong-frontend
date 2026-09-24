import Link from "next/link";
import { User, Building2, ArrowRight, CheckCircle } from "lucide-react";

const OPTIONS = [
  {
    id: "utilizator",
    icon: User,
    iconBg: "#dcfafb",
    iconColor: "#5656e5",
    title: "Creează cont de utilizator",
    desc: "Accesează resurse, ghiduri și instrumente din biblioteca Crestem.ONG. Ideal dacă ești profesionist în sectorul nonprofit sau dorești să explorezi platforma.",
    benefits: ["Acces la biblioteca completă de resurse", "Participare la webinarii și evenimente", "Newsletter săptămânal cu resurse noi"],
    cta: "Creează cont",
    href: "/inregistrare/utilizator",
    available: true,
    recommended: false,
  },
  {
    id: "ong",
    icon: Building2,
    iconBg: "#e5f9e5",
    iconColor: "#007d58",
    title: "Reprezint un ONG",
    desc: "Înscrie organizația ta în platforma Crestem.ONG pentru a accesa evaluarea organizațională, programele de accelerare și mentorat specializat.",
    benefits: ["Evaluare organizațională completă", "Acces la programe și acceleratoare", "Mentorat 1:1 cu experți ONG"],
    cta: "Înregistrează organizația",
    href: "/inregistrare/ong",
    available: true,
    recommended: true,
  },
] as const;

export function AccountTypeCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        return (
          <div
            key={opt.id}
            className="rounded-2xl border flex flex-col p-8 relative bg-white"
            style={{
              borderColor: opt.recommended ? "#007d58" : "#e2e8f0",
              boxShadow: opt.recommended ? "0 0 0 2px #00d49522" : undefined,
            }}
          >
            {opt.recommended && (
              <div
                className="absolute -top-3 left-8 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "#00d495", color: "#ffffff" }}
              >
                Recomandat pentru ONG-uri
              </div>
            )}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: opt.iconBg }}>
              <Icon size={26} style={{ color: opt.iconColor }} />
            </div>
            <h2 className="mb-3 font-heading font-extrabold text-xl" style={{ color: "#1c1c81" }}>
              {opt.title}
            </h2>
            <p className="mb-6 leading-relaxed text-sm" style={{ color: "#5b6779" }}>
              {opt.desc}
            </p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {opt.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: opt.iconColor }} />
                  <span className="text-sm" style={{ color: "#475569" }}>{b}</span>
                </li>
              ))}
            </ul>
            {opt.available ? (
              <Link
                href={opt.href}
                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:brightness-90 hover:-translate-y-0.5 text-white"
                style={{ background: "#00d495", boxShadow: "0 4px 20px rgba(0,212,149,0.3)" }}
              >
                {opt.cta} <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <button
                  disabled
                  className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                  style={{ background: "#f1f5f9", color: "#5b6779" }}
                >
                  {opt.cta} <ArrowRight size={16} />
                </button>
                <p className="text-center text-xs mt-2" style={{ color: "#5b6779" }}>În curând</p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
