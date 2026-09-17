import { NextResponse } from "next/server";
import { prismaStatus, getDb } from "@/lib/db";
import { getWeekPlanRows } from "@/lib/menu-db";
import { getWeekStart } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Kurz-Diagnose ohne SSH – sagt in einem Aufruf, WAS kaputt ist.
 *
 * Entstanden nach dem Totalausfall 14.–17.09.2026: Die Website lieferte nur
 * „Internal Server Error", und es kostete viel Zeit herauszufinden, dass die
 * Datenbank lief und allein der Prisma-Client hinüber war. Gibt absichtlich
 * nur Ja/Nein-Werte zurück, niemals Zugangsdaten.
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

  // 1) Direkter MariaDB-Zugriff (trägt /wochenplan und die Menü-Grafiken)
  try {
    const rows = await getWeekPlanRows(getWeekStart());
    out.datenbankDirekt = { ok: true, gerichteDieseWoche: rows.length };
  } catch (e) {
    out.ok = false;
    out.datenbankDirekt = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  // 2) Prisma (trägt Startseite, Speisekarte, Bestellungen, Login, Cron-Posts)
  const status = prismaStatus();
  if (!status.ok) {
    out.ok = false;
    out.prisma = status;
  } else {
    try {
      const count = await getDb().menuItem.count();
      out.prisma = { ok: true, gerichteGesamt: count };
    } catch (e) {
      out.ok = false;
      out.prisma = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  return NextResponse.json(out, { status: out.ok ? 200 : 503 });
}
