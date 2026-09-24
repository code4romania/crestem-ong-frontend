import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthPageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  backHref?: string;
  backLabel?: string;
}

export function AuthPageHeader({ eyebrow, title, subtitle, backHref, backLabel }: AuthPageHeaderProps) {
  return (
    <section
      className="py-16"
      style={{ background: "linear-gradient(135deg, #0d1b35 0%, #1c1c81 100%)" }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        {backHref && (
          <Link
            href={backHref}
            className="flex justify-center items-center gap-2 text-sm font-medium mb-6 transition-opacity hover:opacity-75"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <ArrowLeft size={16} /> {backLabel}
          </Link>
        )}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "rgba(0,212,149,0.15)", color: "#00d495", border: "1px solid rgba(0,212,149,0.3)" }}
        >
          {eyebrow}
        </div>
        <h1
          className="text-white mb-4 font-heading"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.15 }}
        >
          {title}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.0625rem", lineHeight: 1.7 }}>
          {subtitle}
        </p>
      </div>
    </section>
  );
}
