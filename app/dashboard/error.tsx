"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "#f8fafc" }}>
      <div className="bg-white rounded-xl border border-border p-8 text-center max-w-md">
        <p className="text-sm mb-4" style={{ color: "#b91c1c" }}>
          A apărut o eroare neașteptată. Încearcă din nou.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "#1c1c81" }}
          >
            Încearcă din nou
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors"
            style={{ color: "#475569" }}
          >
            Pagina principală
          </Link>
        </div>
      </div>
    </div>
  );
}
