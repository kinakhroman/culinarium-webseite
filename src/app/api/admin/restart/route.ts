import { NextResponse } from "next/server";
import { scheduleSelfRestart } from "@/lib/self-restart";

export const dynamic = "force-dynamic";

/**
 * App-Prozess sauber neu starten – ohne SSH.
 *
 * Zwei Aufgaben:
 *  - Hostinger-Prozess nach der Foto-Generierung auffrischen (siehe
 *    src/lib/self-restart.ts), damit Poster/PDF/Story weiter rendern.
 *  - Notbremse, wenn der laufende Prozess hängt.
 *
 * WICHTIG (Ausfall 14.–17.09.2026): Diese Route bindet `auth` NICHT fest ein.
 * Damals riss ein kaputter Prisma-Client jede Route mit sich, die auth (und
 * damit die Datenbank) importiert – ausgerechnet auch die Notbremse. Der
 * API-Schlüssel wird deshalb ohne Datenbank geprüft; die Admin-Sitzung nur
 * nachrangig und abgesichert.
 *
 * Auth: x-api-key/Bearer/?key= === MENU_API_KEY ODER Admin-Session
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

  // Rückfall Admin-Sitzung – darf bei kaputter Datenbank nicht mitreißen.
  try {
    const { auth } = await import("../../../../../auth");
    const session = await auth();
    return !!session?.user && session.user.role === "ADMIN";
  } catch {
    return false;
  }
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
