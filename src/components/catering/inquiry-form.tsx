"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type FormState = "idle" | "sending" | "sent" | "error";

export function CateringInquiryForm() {
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");

    const fd = new FormData(e.currentTarget);
    const data = {
      company: (fd.get("company") as string) || undefined,
      contactName: fd.get("contactName") as string,
      site: fd.get("site") as string,
      people: (fd.get("people") as string) || undefined,
      phone: fd.get("phone") as string,
      email: (fd.get("email") as string) || undefined,
      message: (fd.get("message") as string) || undefined,
    };

    try {
      const res = await fetch("/api/catering-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setState("sent");
        (e.target as HTMLFormElement).reset();
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl bg-paper/10 border border-paper/20 p-8 text-center">
        <CheckCircle2 className="h-14 w-14 text-ember mx-auto mb-4" />
        <h3 className="font-display text-2xl font-semibold text-paper mb-2">
          Anfrage ist raus!
        </h3>
        <p className="text-paper/75 leading-relaxed">
          Vielen Dank. Wir melden uns in der Regel noch am selben Werktag bei
          Ihnen – telefonisch oder per E-Mail – und besprechen Mengen, Lieferzeit
          und Konditionen.
        </p>
        <button
          onClick={() => setState("idle")}
          className="mt-6 text-sm font-bold text-ember hover:text-paper transition-colors"
        >
          Weitere Anfrage senden
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Firma" name="company" placeholder="z. B. Mustermann Bau GmbH" />
        <Field label="Ansprechpartner" name="contactName" placeholder="Vor- und Nachname" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Baustelle / Ort" name="site" placeholder="Adresse oder Stadtteil" required />
        <Field label="Personen (ca.)" name="people" placeholder="z. B. 12" inputMode="numeric" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Telefon" name="phone" type="tel" placeholder="Für Rückruf" required />
        <Field label="E-Mail" name="email" type="email" placeholder="optional" />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-bold text-paper/90 mb-1.5">
          Nachricht
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          placeholder="Wie oft, ab wann, besondere Wünsche (z. B. vegetarisch / halal)?"
          className="w-full rounded-xl bg-paper/95 border border-transparent px-4 py-3 text-ink placeholder:text-ink/40 outline-none transition-all focus:border-ember focus:ring-2 focus:ring-ember/30"
        />
      </div>

      {state === "error" && (
        <div className="flex items-center gap-2 text-ember text-sm font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Etwas ist schiefgelaufen. Bitte rufen Sie uns kurz an – wir helfen sofort.
        </div>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-ember hover:brightness-105 disabled:opacity-70 px-6 py-4 text-base font-bold text-ink transition-all active:scale-[0.99]"
      >
        {state === "sending" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Wird gesendet…
          </>
        ) : (
          <>
            <Send className="h-5 w-5" /> Unverbindlich anfragen
          </>
        )}
      </button>
      <p className="text-xs text-paper/55 text-center">
        Kostenlos &amp; unverbindlich. Wir nutzen Ihre Daten nur zur Bearbeitung
        der Anfrage.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
  inputMode,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  inputMode?: "numeric" | "text" | "tel" | "email";
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-bold text-paper/90 mb-1.5">
        {label}
        {required && <span className="text-ember"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        inputMode={inputMode}
        placeholder={placeholder}
        className="w-full rounded-xl bg-paper/95 border border-transparent px-4 py-3 text-ink placeholder:text-ink/40 outline-none transition-all focus:border-ember focus:ring-2 focus:ring-ember/30"
      />
    </div>
  );
}
