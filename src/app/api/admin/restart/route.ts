import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { scheduleSelfRestart } from "@/lib/self-restart";

export const dynamic = "force-dynamic";

/**
 * App-Prozess sauber neu starten – ohne SSH.
 *
 * Hintergrund (Incidents 24.08. + 28.08.2026): Auf dem Hostinger-Webhost
 * degradiert der lange laufende next-server-Prozess innerhalb weniger Tage:
 * normale Seiten laufen weiter, aber alles mit ImageResponse/satori
 * (Menü-Poster, PDF, Tages-Story) antwortet mit 503, und morgens hängt der
 * Server zeitweise ganz. Bisher half nur ein manueller Neustart per SSH.
 *
 * Diese Route sendet ihre Antwort und beendet danach den eigenen Prozess
 * regulär (process.exit). LiteSpeed startet beim nächsten Aufruf der
 * öffentlichen URL automatisch einen frischen Prozess. Der GitHub-Cron ruft
 * die Route jeden Morgen vor dem Posten auf.
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

async function run() {
  const uptimeSec = Math.round(process.uptime());
  // Erst die Antwort rausgehen lassen, dann regulär beenden.
  const restarting = scheduleSelfRestart(500, "manuell/Cron über /api/admin/restart");
  return NextResponse.json({
    ok: true,
    restarting,
    pid: process.pid,
    uptimeSec,
    hint: "Prozess beendet sich – der nächste Aufruf der Website startet einen frischen.",
  });
}

export async function POST(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  return run();
}

export async function GET(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  return run();
}
