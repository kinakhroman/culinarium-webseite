"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Check } from "lucide-react";

type Profile = {
  name: string;
  email: string;
  phone: string | null;
  street: string | null;
  houseNumber: string | null;
  postalCode: string | null;
  city: string | null;
};

export default function ProfilEinstellungenPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setProfile(data))
      .catch(() => setError("Profil konnte nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        phone: fd.get("phone"),
        street: fd.get("street"),
        houseNumber: fd.get("houseNumber"),
        postalCode: fd.get("postalCode"),
        city: fd.get("city"),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      const err = await res.json().catch(() => ({}));
      setError(typeof err.error === "string" ? err.error : "Speichern fehlgeschlagen.");
    }
  }

  if (loading) return <div className="py-12 text-center text-neutral-500">Lädt…</div>;

  const input =
    "w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/konto" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary mb-4">
        <ArrowLeft className="h-4 w-4" /> Zurück zum Konto
      </Link>
      <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-8">Profil bearbeiten</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">E-Mail</label>
          <input value={profile?.email ?? ""} disabled className={`${input} bg-neutral-50 text-neutral-400`} />
          <p className="text-xs text-neutral-400 mt-1">E-Mail kann nicht geändert werden.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
          <input name="name" required minLength={2} defaultValue={profile?.name ?? ""} className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Telefon</label>
          <input name="phone" type="tel" defaultValue={profile?.phone ?? ""} className={input} placeholder="030 …" />
        </div>

        <div className="pt-2 border-t border-neutral-100">
          <p className="text-sm font-semibold text-neutral-700 mb-3">Lieferadresse (optional)</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-neutral-500 mb-1">Straße</label>
              <input name="street" defaultValue={profile?.street ?? ""} className={input} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Nr.</label>
              <input name="houseNumber" defaultValue={profile?.houseNumber ?? ""} className={input} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">PLZ</label>
              <input name="postalCode" defaultValue={profile?.postalCode ?? ""} className={input} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-neutral-500 mb-1">Ort</label>
              <input name="city" defaultValue={profile?.city ?? ""} className={input} />
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saved ? <><Check className="h-5 w-5" /> Gespeichert</> : <><Save className="h-5 w-5" /> {saving ? "Speichert…" : "Speichern"}</>}
        </button>
      </form>

      <PasswordChange />
    </div>
  );
}

function PasswordChange() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const input =
    "w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: fd.get("currentPassword"),
        newPassword: fd.get("newPassword"),
      }),
    });
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Passwort geändert." });
      (e.target as HTMLFormElement).reset();
    } else {
      const err = await res.json().catch(() => ({}));
      setMsg({
        ok: false,
        text: typeof err.error === "string" ? err.error : "Ändern fehlgeschlagen.",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 bg-white rounded-2xl border border-neutral-100 p-6 space-y-4"
    >
      <h2 className="font-heading text-lg font-bold text-neutral-800">Passwort ändern</h2>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Aktuelles Passwort
        </label>
        <input name="currentPassword" type="password" required className={input} />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Neues Passwort (min. 8 Zeichen)
        </label>
        <input name="newPassword" type="password" required minLength={8} className={input} />
      </div>
      {msg && (
        <p
          className={`text-sm p-3 rounded-lg ${
            msg.ok ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"
          }`}
        >
          {msg.text}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 bg-neutral-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-neutral-700 transition-colors disabled:opacity-50"
      >
        {busy ? "Ändert…" : "Passwort ändern"}
      </button>
    </form>
  );
}
