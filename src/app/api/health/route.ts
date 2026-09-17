import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Kurz-Diagnose ohne SSH – sagt in einem Aufruf, WAS kaputt ist.
 *
 * Entstanden beim Totalausfall 14.–17.09.2026: Die Website lieferte überall
 * „Internal Server Error", und ohne Serverzugriff war nicht erkennbar, dass
 * die Datenbank lief und allein der Prisma-Client hinüber war.
 *
 * WICHTIG: Diese Route bindet nichts fest ein, was ausfallen kann – alle
 * Prüfungen laufen über `await import(...)` in try/catch. Sonst reißt ein
 * kaputtes Modul die Diagnose-Route selbst mit (genau das passierte).
 * Gibt nur Ja/Nein und Fehlertexte zurück, niemals Zugangsdaten.
 */
export async function GET() {
  const out: Record<string, unknown> = {
    ok: true,
    zeit: new Date().toISOString(),
    pid: process.pid,
    laufzeitSek: Math.round(process.uptime()),
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      MENU_API_KEY: !!process.env.MENU_API_KEY,
      META_GRAPH_TOKEN: !!process.env.META_GRAPH_TOKEN,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    },
  };

  const fail = (schritt: string, e: unknown) => {
    out.ok = false;
    out[schritt] = {
      ok: false,
      error: e instanceof Error ? `${e.name}: ${e.message}` : String(e),
    };
  };

  // 1) Direkter MariaDB-Zugriff (trägt /wochenplan und die Menü-Grafiken)
  try {
    const { getWeekPlanRows } = await import("@/lib/menu-db");
    const { getWeekStart } = await import("@/lib/utils");
    const rows = await getWeekPlanRows(getWeekStart());
    out.datenbankDirekt = { ok: true, gerichteDieseWoche: rows.length };
  } catch (e) {
    fail("datenbankDirekt", e);
  }

  // 2) Prisma-Paket überhaupt ladbar? (hier scheiterte es im September)
  try {
    await import("@prisma/client");
    out.prismaPaket = { ok: true };
  } catch (e) {
    fail("prismaPaket", e);
  }

  // 3) Prisma-Client erzeugen und eine echte Abfrage ausführen
  if ((out.prismaPaket as { ok?: boolean })?.ok) {
    try {
      const { getDb } = await import("@/lib/db");
      const count = await getDb().menuItem.count();
      out.prisma = { ok: true, gerichteGesamt: count };
    } catch (e) {
      fail("prisma", e);
    }
  }

  return NextResponse.json(out, { status: out.ok ? 200 : 503 });
}
