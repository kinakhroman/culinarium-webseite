"use client";

import { useEffect, useState } from "react";
import {
  Download,
  ClipboardPaste,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Copy,
} from "lucide-react";

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

type AutoResult = {
  success?: boolean;
  weekStart?: string;
  gerichte?: { tag: number; name: string; preis: number }[];
  captions?: { instagram: string; facebook: string } | null;
  steps?: {
    fotos?: { neu: string[]; vorhanden: string[]; fehler: string[] };
    social?: { posted?: string[]; hinweis?: string; fehler?: string[] };
  };
  error?: string;
};

export default function AdminWochenplanPage() {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [current, setCurrent] = useState<Current | null>(null);
  const [bust, setBust] = useState(Date.now());

  // Vollautomatik
  const [rawText, setRawText] = useState("");
  const [price, setPrice] = useState("6.90");
  const [autoState, setAutoState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [autoResult, setAutoResult] = useState<AutoResult | null>(null);

  async function runAutomatic() {
    setAutoState("running");
    setAutoResult(null);
    try {
      const res = await fetch("/api/admin/publish-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText,
          defaultPrice: parseFloat(price.replace(",", ".")) || 6.9,
        }),
      });
      const data: AutoResult = await res.json();
      setAutoResult(data);
      if (res.ok && data.success) {
        setAutoState("done");
        setBust(Date.now());
        loadCurrent();
      } else {
        setAutoState("error");
      }
    } catch {
      setAutoState("error");
      setAutoResult({ error: "Netzwerkfehler – bitte erneut versuchen." });
    }
  }

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
        Menü einfügen (egal in welcher Sprache) — der Rest passiert automatisch.
      </p>

      {/* ── Vollautomatik ── */}
      <div className="mb-10 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-warm-50 to-secondary/5 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-xl font-bold text-neutral-800">
            Automatik: Einfügen &amp; fertig
          </h2>
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          Wochenmenü einfach reinkopieren (z.&nbsp;B. auf Ukrainisch von den Kollegen). Es wird
          übersetzt, die Website aktualisiert, Fotos werden generiert und Social-Media-Beiträge
          vorbereitet bzw. gepostet.
        </p>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={7}
          placeholder={"Меню на тиждень 8–12 червня\nПонеділок: Солянка, курка з локшиною, салат\nВівторок: М'ясні рулети з грибами та картоплею…"}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="text-sm text-neutral-600">
            Einheitspreis (€):{" "}
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-20 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm text-center"
            />
          </label>
          <button
            onClick={runAutomatic}
            disabled={autoState === "running" || rawText.trim().length < 10}
            className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark disabled:opacity-60 px-6 py-3 text-white font-bold transition-colors"
          >
            {autoState === "running" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Läuft… (kann 1–2 Min dauern)
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" /> Übersetzen &amp; veröffentlichen
              </>
            )}
          </button>
        </div>

        {autoResult && (
          <div className="mt-4 rounded-xl bg-white border border-neutral-100 p-4 text-sm space-y-3">
            {autoResult.error ? (
              <p className="flex items-start gap-2 text-red-600">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {autoResult.error}
              </p>
            ) : (
              <>
                <p className="flex items-start gap-2 text-accent font-semibold">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  Woche {autoResult.weekStart}: {autoResult.gerichte?.length} Gerichte
                  veröffentlicht.
                </p>
                {autoResult.gerichte && (
                  <ul className="text-neutral-600 space-y-0.5">
                    {autoResult.gerichte.map((g, i) => (
                      <li key={i}>
                        {DAYS[g.tag] ?? `Tag ${g.tag}`}: {g.name} — {g.preis.toFixed(2)} €
                      </li>
                    ))}
                  </ul>
                )}
                {autoResult.steps?.fotos && (
                  <p className="text-neutral-500">
                    Fotos: {autoResult.steps.fotos.neu.length} neu generiert,{" "}
                    {autoResult.steps.fotos.vorhanden.length} vorhanden
                    {autoResult.steps.fotos.fehler.length > 0 &&
                      `, ${autoResult.steps.fotos.fehler.length} fehlgeschlagen`}
                  </p>
                )}
                {autoResult.steps?.social && (
                  <p className="text-neutral-500">
                    Social:{" "}
                    {autoResult.steps.social.posted?.length
                      ? `gepostet auf ${autoResult.steps.social.posted.join(" + ")}`
                      : autoResult.steps.social.hinweis || "—"}
                  </p>
                )}
                {autoResult.captions && (
                  <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
                    {(["instagram", "facebook"] as const).map((p) => (
                      <div key={p} className="rounded-lg bg-warm-50 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            {p}
                          </span>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(autoResult.captions![p])
                            }
                            className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                          >
                            <Copy className="h-3 w-3" /> Kopieren
                          </button>
                        </div>
                        <p className="whitespace-pre-wrap text-neutral-700 text-xs">
                          {autoResult.captions![p]}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Eingabe */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-neutral-700">
              Manuell: Menü-JSON einfügen
            </label>
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
