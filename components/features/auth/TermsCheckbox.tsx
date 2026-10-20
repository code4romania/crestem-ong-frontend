"use client";

import Link from "next/link";
import type { UseFormRegisterReturn } from "react-hook-form";

type TermsCheckboxProps = {
  registration: UseFormRegisterReturn;
  checked: boolean;
  error?: string;
};

export function TermsCheckbox({ registration, checked, error }: TermsCheckboxProps) {
  return (
    <div
      className="mt-2 rounded-xl p-5"
      style={{
        background: error ? "#fff5f5" : "#f8faff",
        border: `1.5px solid ${error ? "#fca5a5" : "#e2e8f0"}`,
      }}
    >
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <div className="relative flex-shrink-0 mt-0.5">
          <input type="checkbox" className="sr-only" {...registration} />
          <div
            className="w-5 h-5 rounded flex items-center justify-center transition-colors"
            style={{
              background: checked ? "#00d495" : "white",
              border: `2px solid ${
                checked ? "#00d495" : error ? "#dc2626" : "#5b6779"
              }`,
            }}
          >
            {checked && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm leading-relaxed" style={{ color: "#475569" }}>
          Prin crearea contului, confirm că am citit și sunt de acord cu{" "}
          <Link
            href="/termeni-si-conditii"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
            style={{ color: "#007d58" }}
          >
            Termenii și condițiile
          </Link>{" "}
          și{" "}
          <Link
            href="/politica-de-confidentialitate"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
            style={{ color: "#007d58" }}
          >
            Politica de confidențialitate
          </Link>
          .
        </span>
      </label>
      {error && (
        <p className="mt-2 text-xs ml-8" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}
    </div>
  );
}
