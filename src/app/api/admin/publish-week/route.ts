import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../../auth";
import { translateAndStructureMenu, generateCaptions } from "@/lib/ai-content";
import { setWeeklyPlan } from "@/lib/weekly-plan";
import { generateDishPhoto } from "@/lib/ai-image";
import { postToBoth } from "@/lib/social-publish";
import { formatWeekRange, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Übersetzung + Fotos + Posten kann dauern

/**
 * POST /api/admin/publish-week
 * Der 1-Klick-Vollautomat: nimmt das rohe Wochenmenü (beliebige Sprache,
 * z. B. Ukrainisch) und erledigt alles:
 *   1. Übersetzen & strukturieren (Claude)
 *   2. Wochenplan auf der Website setzen
 *   3. Fehlende Gericht-Fotos generieren (Gemini)
 *   4. Social-Captions schreiben (Claude)
 *   5. Auf Instagram + Facebook posten (Meta) – falls Token gesetzt,
 *      sonst werden Entwürfe gespeichert
 *
 * Body: { rawText: string, weekStart?: "YYYY-MM-DD", defaultPrice?: number, post?: boolean }
 * Auth: Admin-Session ODER x-api-key === MENU_API_KEY
 */
export async function POST(req: Request) {
  const session = await auth();
  const isAdmin = !!session?.user && session.user.role === "ADMIN";
  const token =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  const tokenOk = !!process.env.MENU_API_KEY && token === process.env.MENU_API_KEY;
  if (!isAdmin && !tokenOk) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const rawText = String(body?.rawText || "").trim();
  if (rawText.length < 10) {
    return NextResponse.json(
      { error: "Bitte das Wochenmenü als Text einfügen (mind. 10 Zeichen)." },
      { status: 400 }
    );
  }
  const defaultPrice = typeof body?.defaultPrice === "number" ? body.defaultPrice : 6.9;
  const doPost = body?.post !== false;

  const steps: Record<string, unknown> = {};

  // 1) Übersetzen & strukturieren
  let items;
  try {
    const translated = await translateAndStructureMenu(rawText, defaultPrice);
    items = translated.items;
    steps.uebersetzung = { ok: true, gerichte: items.length };
  } catch (e) {
    return NextResponse.json(
      { error: `Übersetzung fehlgeschlagen: ${e instanceof Error ? e.message : "Fehler"}` },
      { status: 502 }
    );
  }
  if (!items?.length) {
    return NextResponse.json(
      { error: "Im Text wurden keine Gerichte erkannt." },
      { status: 400 }
    );
  }

  // 2) Wochenplan setzen
  const { weekStart, count } = await setWeeklyPlan(items, body?.weekStart);
  steps.wochenplan = { ok: true, count };

  // 3) Fehlende Fotos generieren (best effort, parallel)
  const photoResults = await Promise.all(
    items.map(async (it) => {
      const slug = slugify(it.name);
      const r = await generateDishPhoto(slug, it.name);
      return { slug, ...r };
    })
  );
  steps.fotos = {
    neu: photoResults.filter((p) => p.ok && !p.skipped).map((p) => p.slug),
    vorhanden: photoResults.filter((p) => p.skipped).map((p) => p.slug),
    fehler: photoResults.filter((p) => !p.ok).map((p) => `${p.slug}: ${p.error}`),
  };

  // 4) Captions schreiben
  const weekRange = formatWeekRange(weekStart);
  let captions: { instagram: string; facebook: string } | null = null;
  try {
    captions = await generateCaptions(items, weekRange);
    steps.captions = { ok: true };
  } catch (e) {
    steps.captions = { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }

  // 5) Posten (oder Entwurf speichern)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://culinarium-berlin.de";
  const posterUrl = `${baseUrl}/api/menu-poster/square`;
  const metaReady = !!(
    (process.env.META_GRAPH_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN) &&
    process.env.FACEBOOK_PAGE_ID &&
    process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
  );

  if (captions) {
    if (doPost && metaReady) {
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
      steps.social = { posted: results.filter((r) => r.ok).map((r) => r.platform),
        fehler: results.filter((r) => !r.ok).map((r) => `${r.platform}: ${r.error}`) };
    } else {
      for (const platform of ["instagram", "facebook"] as const) {
        await db.socialPost.create({
          data: {
            platform,
            caption: captions[platform],
            imageUrl: posterUrl,
            status: "DRAFT",
          },
        });
      }
      steps.social = {
        posted: [],
        hinweis: metaReady
          ? "Posten deaktiviert (post: false) – Entwürfe gespeichert."
          : "Meta-Token fehlt – Captions als Entwürfe gespeichert.",
      };
    }
  }

  return NextResponse.json({
    success: true,
    weekStart: weekRange,
    gerichte: items.map((i) => ({ tag: i.dayOfWeek, name: i.name, preis: i.price })),
    captions,
    steps,
  });
}
