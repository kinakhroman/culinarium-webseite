import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../../auth";
import { getWeekPlanRows } from "@/lib/menu-db";
import { getWeekStart, DAYS_DE, formatCurrency, slugify } from "@/lib/utils";
import { generateDailyCaption } from "@/lib/ai-content";
import { postToBoth, postStoryToInstagram, metaConfigured } from "@/lib/social-publish";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Täglicher Auto-Post (gedacht für Cron Mo–Fr früh): postet das HEUTIGE
 * Tagesgericht als Feed-Beitrag auf Instagram + Facebook UND als Instagram-Story.
 * Am Wochenende oder wenn kein Gericht hinterlegt ist, passiert nichts.
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
  const now = new Date();
  const jsDay = now.getDay(); // 0=So … 6=Sa
  if (jsDay === 0 || jsDay === 6) {
    return NextResponse.json({ ok: true, skipped: "Wochenende – kein Tagespost" });
  }
  const todayIdx = jsDay - 1; // 0=Mo … 4=Fr

  const rows = await getWeekPlanRows(getWeekStart(now));
  const today = rows.filter((r) => r.dayOfWeek === todayIdx);
  if (today.length === 0) {
    return NextResponse.json({ ok: true, skipped: "Kein Gericht für heute hinterlegt" });
  }
  const dish = today[0];

  // Bild: Gericht-Foto, sonst die Wochen-Menügrafik als Rückfall
  const imgPath = dish.imageUrl || "/api/menu-poster/square";
  const imageUrl = imgPath.startsWith("http") ? imgPath : `${baseUrl}${imgPath}`;

  // Doppel-Post-Schutz: heute schon mit diesem Bild gepostet?
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const already = await db.socialPost.findFirst({
    where: { status: "POSTED", postedAt: { gte: startOfDay }, imageUrl },
  });
  if (already) {
    return NextResponse.json({ ok: true, skipped: "Heute bereits gepostet", imageUrl });
  }

  const dayName = DAYS_DE[todayIdx];

  // Captions (KI), mit Vorlage als Rückfall, falls ANTHROPIC fehlt/Fehler
  let captions: { instagram: string; facebook: string };
  try {
    captions = await generateDailyCaption(
      { name: dish.name, note: dish.note, price: dish.price },
      dayName
    );
  } catch {
    const priceTxt = dish.price > 0 ? ` – ${formatCurrency(dish.price)}` : "";
    const noteTxt = dish.note ? ` ${dish.note}.` : "";
    const tag = slugify(dish.name).replace(/-/g, "");
    captions = {
      instagram: `🍽️ ${dayName} bei Culinarium am Biesenhorst:\n${dish.name}${priceTxt}.${noteTxt}\n\nFrisch gekocht – heute bei uns! Vorbestellen 👉 culinarium-berlin.de\n\n#Mittagstisch #Kantine #BerlinLichtenberg #frischgekocht #Mittagspause${tag ? ` #${tag}` : ""}`,
      facebook: `Heute (${dayName}) frisch in unserer Küche: ${dish.name}${priceTxt}.${noteTxt} Kommt vorbei oder bestellt vor unter culinarium-berlin.de. #Mittagstisch #Kantine`,
    };
  }

  // 1) Feed auf IG + FB, 2) IG-Story
  const feed = await postToBoth(captions.instagram, imageUrl);
  const story = await postStoryToInstagram(imageUrl);

  // protokollieren
  for (const r of feed) {
    await db.socialPost.create({
      data: {
        platform: r.platform,
        caption: r.platform === "facebook" ? captions.facebook : captions.instagram,
        imageUrl,
        status: r.ok ? "POSTED" : "FAILED",
        postedAt: r.ok ? new Date() : null,
        error: r.error || null,
      },
    });
  }
  await db.socialPost.create({
    data: {
      platform: "instagram",
      caption: `[STORY] ${captions.instagram}`,
      imageUrl,
      status: story.ok ? "POSTED" : "FAILED",
      postedAt: story.ok ? new Date() : null,
      error: story.error || null,
    },
  });

  return NextResponse.json({
    ok: true,
    tag: dayName,
    gericht: dish.name,
    imageUrl,
    feed: feed.map((r) => ({ platform: r.platform, ok: r.ok, id: r.id, error: r.error })),
    story: { ok: story.ok, id: story.id, error: story.error },
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
