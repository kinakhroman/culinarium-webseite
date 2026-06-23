import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../../auth";
import { getWeekPlanRows } from "@/lib/menu-db";
import { getWeekStart, toISODateLocal, formatWeekRange, DAYS_DE } from "@/lib/utils";
import { generateCaptions } from "@/lib/ai-content";
import { postToBoth, metaConfigured } from "@/lib/social-publish";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Wöchentlicher Auto-Post (gedacht für Cron freitags): bewirbt das Menü der
 * KOMMENDEN Woche als Menügrafik auf Instagram + Facebook. Wenn für nächste
 * Woche noch kein Plan hinterlegt ist, passiert nichts (kein leeres Poster).
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
  if (!metaConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Meta nicht konfiguriert (META_GRAPH_TOKEN / FACEBOOK_PAGE_ID / INSTAGRAM_BUSINESS_ACCOUNT_ID fehlt)" },
      { status: 503 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://culinarium-berlin.de";

  // Montag der KOMMENDEN Woche
  const nextWeek = getWeekStart();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const rows = await getWeekPlanRows(nextWeek);
  if (rows.length === 0) {
    return NextResponse.json({
      ok: true,
      skipped: "Für nächste Woche ist noch kein Menü hinterlegt – nichts gepostet.",
      weekStart: toISODateLocal(nextWeek),
    });
  }

  const items = rows.map((r) => ({
    dayOfWeek: r.dayOfWeek,
    name: r.name,
    description: r.name,
    note: r.note ?? undefined,
    price: r.price,
  }));
  const weekRange = formatWeekRange(nextWeek);
  const posterUrl = `${baseUrl}/api/menu-poster/square?week=${toISODateLocal(nextWeek)}`;

  // Doppel-Post-Schutz: dieses Wochen-Poster heute schon gepostet?
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const already = await db.socialPost.findFirst({
    where: { status: "POSTED", postedAt: { gte: startOfDay }, imageUrl: posterUrl },
  });
  if (already) {
    return NextResponse.json({ ok: true, skipped: "Wochenmenü heute bereits gepostet", weekRange });
  }

  // Captions (KI), mit Vorlage als Rückfall
  let captions: { instagram: string; facebook: string };
  try {
    captions = await generateCaptions(items, weekRange);
  } catch {
    const lines = items
      .map((i) => `${DAYS_DE[i.dayOfWeek] ?? "?"}: ${i.name}`)
      .join("\n");
    captions = {
      instagram: `🍽️ Unser Wochenmenü ${weekRange} bei Culinarium am Biesenhorst:\n\n${lines}\n\nJeden Tag frisch gekocht – wir freuen uns auf euch!\nVorbestellen 👉 culinarium-berlin.de\n\n#Mittagstisch #Wochenmenü #Kantine #BerlinLichtenberg #frischgekocht #Mittagspause`,
      facebook: `Das erwartet euch nächste Woche (${weekRange}) bei Culinarium am Biesenhorst:\n${lines}\n\nFrisch gekocht, Mo–Fr. Vorbestellen unter culinarium-berlin.de. #Mittagstisch #Wochenmenü`,
    };
  }

  const results = await postToBoth(captions.instagram, posterUrl);
  for (const r of results) {
    await db.socialPost.create({
      data: {
        platform: r.platform,
        caption: r.platform === "facebook" ? captions.facebook : captions.instagram,
        imageUrl: posterUrl,
        status: r.ok ? "POSTED" : "FAILED",
        postedAt: r.ok ? new Date() : null,
        error: r.error || null,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    weekRange,
    gerichte: items.length,
    posterUrl,
    posted: results.map((r) => ({ platform: r.platform, ok: r.ok, id: r.id, error: r.error })),
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
