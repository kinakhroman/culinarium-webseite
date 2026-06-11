"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const KEY = "ckm-cookie-consent";

/**
 * DSGVO-Cookie-Hinweis. Die Seite nutzt nur technisch notwendige Cookies
 * (Login-Session, Warenkorb). Optionale Cookies werden nur nach Zustimmung
 * gesetzt. Die Entscheidung wird lokal gespeichert (kein erneutes Nachfragen).
 */
export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* localStorage nicht verfügbar – Banner nicht zeigen */
    }
  }, []);

  function decide(choice: "all" | "essential") {
    try {
      localStorage.setItem(KEY, JSON.stringify({ choice, ts: Date.now() }));
    } catch {
      /* ignorieren */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white/95 p-5 shadow-2xl shadow-black/10 backdrop-blur-md sm:p-6">
        <div className="flex items-start gap-3">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:flex">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-base font-bold text-neutral-800">
              Wir verwenden Cookies
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-neutral-500">
              Wir nutzen technisch notwendige Cookies, damit Anmeldung und Warenkorb
              funktionieren. Optionale Cookies (z.&nbsp;B. für Statistik) setzen wir nur mit
              deiner Zustimmung. Mehr dazu in unserer{" "}
              <Link href="/datenschutz" className="font-medium text-primary hover:underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                onClick={() => decide("all")}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Alle akzeptieren
              </button>
              <button
                onClick={() => decide("essential")}
                className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-600 transition-colors hover:border-primary hover:text-primary"
              >
                Nur notwendige
              </button>
              <Link
                href="/datenschutz"
                className="px-2 py-2.5 text-center text-sm font-medium text-neutral-400 hover:text-primary sm:ml-auto"
              >
                Mehr erfahren
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
