import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { getWeekStart, toISODateLocal } from "@/lib/utils";
import { sendWeeklyMenuMail } from "@/lib/weekly-mail";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Wöchentlicher Menü-Versand per E-Mail an den festen Verteiler (Tabelle
 * MailingRecipient). Gedacht für Cron freitags – bewirbt standardmäßig das
 * Menü der KOMMENDEN Woche (passend zum Social-Wochenpost).
 *
 * Wochenwahl per Query:
 *   ?week=next     (Standard) – Menü der nächsten Woche
 *   ?week=current  – Menü der laufenden Woche (praktisch zum Testen)
 *   ?week=YYYY-MM-DD – Montag einer bestimmten Woche
 *
 * Auth: Admin-Session ODER x-api-key/Bearer === MENU_API_KEY ODER ?key=MENU_API_KEY
 */
async function authorized(req: Request): Promise<boolean> {
  const url = new URL(req.url);
  const keyParam = url.searchParams.get("key") || "";
  const header =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  const apiKey = process.env.MENU_API_KEY;
  if (apiKey && (header === apiKey || keyParam === apiKey)) return true;
  const session = await auth();
  return !!session?.user && session.user.role === "ADMIN";
}

function resolveWeekStart(req: Request): Date {
  const week = new URL(req.url).searchParams.get("week") || "next";
  if (week === "current") return getWeekStart();
  if (/^\d{4}-\d{2}-\d{2}$/.test(week)) {
    const d = new Date(`${week}T00:00:00`);
    if (!isNaN(d.getTime())) return getWeekStart(d);
  }
  // Standard: kommende Woche
  const next = getWeekStart();
  next.setDate(next.getDate() + 7);
  return next;
}

async function run(req: Request) {
  const weekStart = resolveWeekStart(req);
  const result = await sendWeeklyMenuMail(weekStart);
  return NextResponse.json({ ...result, weekStart: toISODateLocal(weekStart) });
}

export async function POST(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  return run(req);
}

export async function GET(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  return run(req);
}
