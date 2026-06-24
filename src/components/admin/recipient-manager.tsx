"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Mail, Send, UserPlus } from "lucide-react";

type Recipient = {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function RecipientManager({ initial }: { initial: Recipient[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMsg, setTestMsg] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/admin/recipients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    setBusy(false);
    if (res.ok) {
      setEmail("");
      setName("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Hinzufügen fehlgeschlagen");
    }
  }

  async function toggle(r: Recipient) {
    setBusy(true);
    await fetch("/api/admin/recipients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, isActive: !r.isActive }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove(r: Recipient) {
    if (!confirm(`${r.email} wirklich aus dem Verteiler entfernen?`)) return;
    setBusy(true);
    await fetch(`/api/admin/recipients?id=${encodeURIComponent(r.id)}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  async function sendTest() {
    setTestMsg(null);
    setBusy(true);
    // Aktuelle Woche – die hat sicher einen Plan; Versand an aktive Empfänger.
    const res = await fetch("/api/cron/weekly-mail?week=current", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok && data.skipped) setTestMsg(`Hinweis: ${data.skipped}`);
    else if (res.ok) setTestMsg(`Versendet: ${data.sent}/${data.recipients} (Woche ${data.weekRange}).`);
    else setTestMsg(data.error || "Senden fehlgeschlagen.");
  }

  const active = initial.filter((r) => r.isActive).length;

  return (
    <div className="space-y-6">
      {/* Hinzufügen */}
      <form onSubmit={add} className="bg-white rounded-2xl border border-neutral-100 p-5">
        <h2 className="font-heading font-bold text-neutral-800 mb-3 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" /> Empfänger hinzufügen
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail-Adresse"
            className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold text-sm px-5 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Hinzufügen
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <p className="text-xs text-neutral-400 mt-3">
          Nur Adressen aufnehmen, die dem Erhalt des Wochenmenüs zugestimmt haben (DSGVO).
        </p>
      </form>

      {/* Probemail */}
      <div className="bg-secondary/10 rounded-2xl border border-secondary/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-neutral-800 flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" /> Wochenmenü jetzt senden (Test)
          </p>
          <p className="text-sm text-neutral-500">
            Schickt das Menü der <strong>laufenden</strong> Woche sofort an alle {active} aktiven Empfänger.
          </p>
          {testMsg && <p className="text-sm text-primary font-medium mt-1">{testMsg}</p>}
        </div>
        <button
          type="button"
          onClick={sendTest}
          disabled={busy || active === 0}
          className="inline-flex items-center justify-center gap-2 bg-white border border-primary/40 text-primary font-semibold text-sm px-5 py-2 rounded-lg hover:bg-primary hover:text-white disabled:opacity-50 whitespace-nowrap"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Jetzt senden
        </button>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-neutral-100">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="font-heading font-bold text-neutral-800">
            Verteiler ({active} aktiv, {initial.length} gesamt)
          </h2>
        </div>
        {initial.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">Noch keine Empfänger im Verteiler.</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {initial.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-neutral-800 truncate">
                    {r.name || r.email}
                  </p>
                  {r.name && <p className="text-sm text-neutral-500 truncate">{r.email}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggle(r)}
                    disabled={busy}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full disabled:opacity-50 ${
                      r.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                    }`}
                  >
                    {r.isActive ? "Aktiv" : "Pausiert"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(r)}
                    disabled={busy}
                    className="text-neutral-400 hover:text-red-600 disabled:opacity-50"
                    aria-label="Empfänger entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
