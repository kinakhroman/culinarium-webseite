"use client";

import { useEffect, useState } from "react";
import { Download, ClipboardPaste, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const DAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

const EXAMPLE = JSON.stringify(
  {
    weekStart: "",
    items: [
      { dayOfWeek: 0, name: "Gulasch mit Kartoffeln", price: 8.9 },
      { dayOfWeek: 0, name: "Gemüse-Curry mit Reis", price: 7.9, isVegetarian: true, isVegan: true },
      { dayOfWeek: 1, name: "Wiener Schnitzel mit Pommes", price: 9.5 },
      { dayOfWeek: 2, name: "Königsberger Klopse", price: 8.5 },
      { dayOfWeek: 3, name: "Spaghetti Bolognese", price: 7.9 },
      { dayOfWeek: 4, name: "Currywurst mit Pommes", price: 6.9 },
    ],
  },
  null,
  2
);

type Current = {
  weekStart: string;
  items: { dayOfWeek: number; note: string | null; menuItem: { name: string; price: number } }[];
};

export default function AdminWochenplanPage() {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [current, setCurrent] = useState<Current | null>(null);
  const [bust, setBust] = useState(Date.now());

  async function loadCurrent() {
    try {
      const res = await fetch("/api/weekly-plan", { cache: "no-store" });
      if (res.ok) setCurrent(await res.json());
    } catch {}
  }
  useEffect(() => {
    loadCurrent();
  }, []);

  async function save() {
    setState("saving");
    setMsg("");
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      setState("error");
      setMsg("Ungültiges JSON. Bitte den Text vom Claude-Projekt sauber einfügen.");
      return;
    }
    try {
      const res = await fetch("/api/weekly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setState("saved");
        setMsg(`Gespeichert: ${data.count} Gerichte für die Woche ab ${data.weekStart}.`);
        setBust(Date.now());
        loadCurrent();
      } else {
        setState("error");
        setMsg(
          typeof data.error === "string"
            ? data.error
            : "Format passt nicht — bitte am Beispiel orientieren."
        );
      }
    } catch {
      setState("error");
      setMsg("Netzwerkfehler.");
    }
  }

  const byDay: Record<number, Current["items"]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
  current?.items.forEach((it) => {
    if (it.dayOfWeek >= 0 && it.dayOfWeek <= 4) byDay[it.dayOfWeek].push(it);
  });

  const formats: { key: string; label: string }[] = [
    { key: "square", label: "Instagram / WhatsApp (1080×1080)" },
    { key: "story", label: "Story (1080×1920)" },
    { key: "print", label: "Aushang A4" },
    { key: "web", label: "Web-Banner" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-2">Wochenmenü pflegen</h1>
      <p className="text-neutral-500 mb-8">
        Füge die Ausgabe deines Claude-Projekts (als JSON) ein und speichere — Website-Wochenplan
        und Menü-Grafik aktualisieren sich automatisch.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Eingabe */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-neutral-700">Menü-JSON einfügen</label>
            <button
              onClick={() => setText(EXAMPLE)}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <ClipboardPaste className="h-3.5 w-3.5" /> Beispiel laden
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={16}
            spellCheck={false}
            placeholder='{ "items": [ { "dayOfWeek": 0, "name": "Gulasch", "price": 8.9 } ] }'
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 font-mono text-sm text-neutral-800 outline-none focus:border-primary"
          />
          <button
            onClick={save}
            disabled={state === "saving" || !text.trim()}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark disabled:opacity-60 px-6 py-3 text-white font-bold transition-colors"
          >
            {state === "saving" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Speichern…
              </>
            ) : (
              "Wochenmenü speichern"
            )}
          </button>

          {msg && (
            <div
              className={`mt-3 flex items-start gap-2 text-sm ${
                state === "error" ? "text-red-600" : "text-accent"
              }`}
            >
              {state === "error" ? (
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              )}
              <span>{msg}</span>
            </div>
          )}

          <details className="mt-5 text-sm text-neutral-500">
            <summary className="cursor-pointer font-semibold text-neutral-600">
              Format-Hinweis (für das Claude-Projekt)
            </summary>
            <p className="mt-2">
              <code>dayOfWeek</code>: 0 = Montag … 4 = Freitag · <code>price</code> in Euro ·
              optional <code>weekStart</code> (YYYY-MM-DD, sonst aktuelle Woche), <code>note</code>,
              <code>isVegetarian</code>, <code>isVegan</code>.
            </p>
          </details>
        </div>

        {/* Vorschau + Download */}
        <div>
          <div className="rounded-2xl border border-neutral-100 overflow-hidden">
            <div className="bg-primary/5 px-5 py-3 border-b border-neutral-100">
              <h2 className="font-heading font-bold text-neutral-800">
                Menü-Grafik (aktuelle Woche)
              </h2>
            </div>
            <div className="p-5">
              <div className="rounded-xl overflow-hidden border border-neutral-100 bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/menu-poster/square?t=${bust}`}
                  alt="Menü-Grafik"
                  className="w-full block"
                />
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formats.map((f) => (
                  <a
                    key={f.key}
                    href={`/api/menu-poster/${f.key}?t=${bust}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 hover:border-primary hover:text-primary transition-colors"
                  >
                    <Download className="h-4 w-4" /> {f.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* aktuelle Woche als Liste */}
          <div className="mt-6 rounded-2xl border border-neutral-100 p-5">
            <h2 className="font-heading font-bold text-neutral-800 mb-3">
              Gespeicherte Woche {current?.weekStart ? `ab ${current.weekStart}` : ""}
            </h2>
            <div className="space-y-2">
              {DAYS.map((day, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-24 shrink-0 font-semibold text-neutral-700">{day}</div>
                  <div className="flex-1 text-neutral-600">
                    {byDay[i].length > 0
                      ? byDay[i].map((it) => it.menuItem.name).join(" · ")
                      : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
