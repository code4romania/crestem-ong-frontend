"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PasswordInput } from "./PasswordInput";
import type { TransferPreview } from "@/lib/api/admin-transfer";
import { formatTransferDate, transferProposerLabel } from "@/lib/admin-transfer-format";
import { loginPathFor, TRANSFER_ADMIN_PATH } from "@/lib/return-to";
import { logoutSession } from "@/lib/api/session";
import {
  acceptAdminTransferAction,
  acceptNewAccountTransferAction,
  declineAdminTransferAction,
  declineNewAccountTransferAction,
} from "@/lib/api/admin-transfer-actions";
import {
  PASSWORDS_MATCH_ERROR,
  PASSWORD_RULES_HINT,
  confirmedPasswordSchema,
  passwordSchema,
  passwordsMatch,
} from "@/lib/validation/password";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors bg-white text-sm";

const primaryButton =
  "w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:brightness-90 disabled:opacity-70";
const secondaryButton =
  "w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-60";

const INVALID_REASONS: Record<"invalid" | "expired" | "resolved", string> = {
  invalid: "Linkul este incomplet sau nu mai există. Verifică linkul din email.",
  expired: "Termenul de 7 zile pentru a răspunde a trecut.",
  resolved: "Propunerea a primit deja un răspuns sau a fost anulată.",
};

const newAccountSchema = z
  .object({ password: passwordSchema, confirmedPassword: confirmedPasswordSchema })
  .refine(passwordsMatch, PASSWORDS_MATCH_ERROR);

type NewAccountValues = z.infer<typeof newAccountSchema>;

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl border border-border shadow-sm p-8">{children}</div>;
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="text-center">
        <AlertCircle size={32} className="mx-auto mb-3" style={{ color: "#b91c1c" }} />
        <h2 className="font-heading font-bold text-lg mb-2" style={{ color: "#1c1c81" }}>
          {title}
        </h2>
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </Card>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl p-4 text-sm"
      style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#b91c1c" }}
    >
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
      {message}
    </div>
  );
}

/**
 * The proposal and the recipient's answer (US-3). Existing accounts answer
 * signed in as the recipient (BR3, A3); an invited address answers with the
 * token and sets its password when it accepts (step 8, D2).
 */
export function AdminTransferResponse({
  token,
  preview,
  currentUser,
}: {
  token: string;
  preview: TransferPreview;
  currentUser: { documentId: string; email: string } | null;
}) {
  const [declined, setDeclined] = useState(false);

  if (!preview.valid) {
    return (
      <Notice title="Invitația nu mai este valabilă">
        <p>{INVALID_REASONS[preview.reason]}</p>
      </Notice>
    );
  }

  if (declined) {
    return (
      <Card>
        <div className="text-center">
          <CheckCircle size={32} className="mx-auto mb-3" style={{ color: "#007d58" }} />
          <h2 className="font-heading font-bold text-lg mb-2" style={{ color: "#1c1c81" }}>
            Ai refuzat propunerea
          </h2>
          <p className="text-sm text-muted-foreground">
            Am anunțat organizația. Nu s-a schimbat nimic în contul tău.
          </p>
        </div>
      </Card>
    );
  }

  const proposer = transferProposerLabel(preview);

  const summary = (
    <div className="space-y-4 text-sm" style={{ color: "#334155" }}>
      <p>
        <strong style={{ color: "#1c1c81" }}>{proposer}</strong> te propune administrator al
        organizației <strong style={{ color: "#1c1c81" }}>{preview.ongName}</strong>.
      </p>
      <div className="rounded-xl border border-border bg-slate-50 px-4 py-3">
        <p className="font-semibold mb-1.5" style={{ color: "#1c1c81" }}>
          Dacă accepți
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>devii administratorul organizației, cu toate drepturile;</li>
          <li>administratorul actual iese din organizație;</li>
          {preview.recipientType === "existing" && (
            <li>nu mai apari în lista de membri, ci ca persoană de contact.</li>
          )}
        </ul>
      </div>
      <p className="text-muted-foreground">
        Propunerea este valabilă până la {formatTransferDate(preview.expiresAt)} și a fost trimisă
        pe {preview.recipientEmailMasked}.
      </p>
    </div>
  );

  if (preview.recipientType === "new") {
    return (
      <Card>
        {summary}
        <NewAccountAnswer token={token} onDeclined={() => setDeclined(true)} />
      </Card>
    );
  }

  const returnHere = `${TRANSFER_ADMIN_PATH}?token=${encodeURIComponent(token)}`;

  if (!currentUser) {
    return (
      <Card>
        {summary}
        <div className="mt-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Autentifică-te cu contul pe care ai primit emailul pentru a răspunde.
          </p>
          <Link href={loginPathFor(returnHere)} className={primaryButton} style={{ background: "#00d495" }}>
            Autentifică-te pentru a răspunde
          </Link>
        </div>
      </Card>
    );
  }

  if (currentUser.documentId !== preview.recipientDocumentId) {
    return (
      <Card>
        {summary}
        <div className="mt-6 space-y-3">
          <ErrorBox message="Această invitație este pentru alt cont. Autentifică-te cu contul căruia i-a fost trimisă." />
          <SwitchAccountButton returnHere={returnHere} />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {summary}
      <ExistingAccountAnswer token={token} onDeclined={() => setDeclined(true)} />
    </Card>
  );
}

function SwitchAccountButton({ returnHere }: { returnHere: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await logoutSession().catch(() => {});
          // A full navigation: the session cookies just changed.
          window.location.assign(loginPathFor(returnHere));
        })
      }
      className={secondaryButton}
      style={{ color: "#1c1c81" }}
    >
      {isPending && <Loader2 size={16} className="animate-spin" />}
      Deconectează-te și intră cu contul corect
    </button>
  );
}

function DeclineButton({
  onDecline,
}: {
  onDecline: () => Promise<{ error?: string }>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={secondaryButton}
        style={{ color: "#dc2626" }}
      >
        Refuză
      </button>
      <ConfirmDialog
        open={confirming}
        title="Refuzi propunerea?"
        description="Organizația va fi anunțată, iar linkul nu va mai putea fi folosit."
        confirmLabel="Refuză propunerea"
        cancelLabel="Înapoi"
        loading={isPending}
        loadingLabel="Se trimite..."
        error={error}
        onConfirm={() =>
          startTransition(async () => {
            const result = await onDecline();
            if (result.error) setError(result.error);
          })
        }
        onCancel={() => {
          setConfirming(false);
          setError(null);
        }}
      />
    </>
  );
}

function ExistingAccountAnswer({ token, onDeclined }: { token: string; onDeclined: () => void }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const accept = () =>
    startTransition(async () => {
      const result = await acceptAdminTransferAction(token);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(result.redirectTo ?? "/dashboard");
      router.refresh();
    });

  return (
    <div className="mt-6 space-y-3">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={primaryButton}
        style={{ background: "#00d495" }}
      >
        Acceptă
      </button>
      <DeclineButton
        onDecline={async () => {
          const result = await declineAdminTransferAction(token);
          if (!result.error) onDeclined();
          return result;
        }}
      />
      <ConfirmDialog
        open={confirming}
        title="Preiei rolul de administrator?"
        description="Devii administratorul organizației, iar administratorul actual iese din organizație."
        confirmLabel="Acceptă"
        cancelLabel="Înapoi"
        confirmVariant="accent"
        loading={isPending}
        loadingLabel="Se preia rolul..."
        error={error}
        onConfirm={accept}
        onCancel={() => {
          setConfirming(false);
          setError(null);
        }}
      />
    </div>
  );
}

function NewAccountAnswer({ token, onDeclined }: { token: string; onDeclined: () => void }) {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewAccountValues>({
    resolver: zodResolver(newAccountSchema),
    defaultValues: { password: "", confirmedPassword: "" },
  });

  const onSubmit = async (data: NewAccountValues) => {
    setApiError(null);
    const result = await acceptNewAccountTransferAction({ token, ...data });
    if (result.error || Object.keys(result.fieldErrors ?? {}).length > 0) {
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        if (field === "password" || field === "confirmedPassword") {
          setError(field, { message });
        }
      }
      setApiError(result.error ?? result.fieldErrors?.token ?? null);
      return;
    }
    router.push(result.redirectTo ?? "/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
      {apiError && <ErrorBox message={apiError} />}
      <p className="text-sm text-muted-foreground">
        Nu ai încă un cont pe platformă. Alege o parolă: contul se activează și preiei rolul în
        același pas.
      </p>
      <div>
        <label htmlFor="transfer-new-password" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
          Parolă nouă
        </label>
        <PasswordInput
          id="transfer-new-password"
          placeholder="Min. 8 caractere"
          className={inputClass}
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
            {errors.password.message}
          </p>
        )}
        <p className="mt-1.5 text-xs text-muted-foreground">{PASSWORD_RULES_HINT}</p>
      </div>
      <div>
        <label htmlFor="transfer-new-confirm" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
          Confirmă parola
        </label>
        <PasswordInput
          id="transfer-new-confirm"
          placeholder="Repetă parola"
          className={inputClass}
          autoComplete="new-password"
          {...register("confirmedPassword")}
        />
        {errors.confirmedPassword && (
          <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
            {errors.confirmedPassword.message}
          </p>
        )}
      </div>
      <div className="space-y-3">
        <button type="submit" disabled={isSubmitting} className={primaryButton} style={{ background: "#00d495" }}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Se activează..." : "Setează parola și acceptă"}
        </button>
        <DeclineButton
          onDecline={async () => {
            const result = await declineNewAccountTransferAction(token);
            if (!result.error) onDeclined();
            return result;
          }}
        />
      </div>
    </form>
  );
}
