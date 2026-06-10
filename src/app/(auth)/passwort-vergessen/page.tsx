"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function PasswortVergessenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const email = (new FormData(e.currentTarget).get("email") as string).trim();
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      // Aus Datenschutzgründen immer weiter zur Code-Eingabe
      router.push(`/passwort-zuruecksetzen?email=${encodeURIComponent(email)}`);
    } else {
      const err = await res.json().catch(() => ({}));
      setError(typeof err.error === "string" ? err.error : "Etwas ist schiefgelaufen.");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-8">
      <h1 className="font-heading text-2xl font-bold text-neutral-800 text-center mb-2">
        Passwort vergessen?
      </h1>
      <p className="text-sm text-neutral-500 text-center mb-6">
        Wir senden Ihnen einen 6-stelligen Code per E-Mail.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
            E-Mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoFocus
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            placeholder="ihre@email.de"
          />
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Mail className="h-5 w-5" />
          {loading ? "Wird gesendet..." : "Code senden"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500 mt-6">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Zurück zur Anmeldung
        </Link>
      </p>
    </div>
  );
}
