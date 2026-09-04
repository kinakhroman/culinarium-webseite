/**
 * Server-seitige Food-Foto-Generierung über die Gemini-Bild-API
 * (gleiche Engine wie nano-banana). Speichert nach public/images/menu/{slug}.png,
 * damit menuImage() das Foto automatisch findet.
 *
 * Benötigt GEMINI_API_KEY. Best-effort: Fehler werfen nicht, sondern geben false zurück.
 */
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const STYLE =
  "professional appetizing food photography, overhead 45-degree angle, served on a rustic ceramic plate on a dark wooden table, warm natural daylight, shallow depth of field, high detail, mouthwatering, no text, square 1:1 composition";

const MODEL = "gemini-2.5-flash-image";

/** Generiert ein Foto für ein Gericht, falls noch keins existiert. */
export async function generateDishPhoto(
  slug: string,
  dishNameGerman: string
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, error: "GEMINI_API_KEY fehlt" };

  const dir = join(process.cwd(), "public", "images", "menu");
  const file = join(dir, `${slug}.png`);
  if (existsSync(file)) return { ok: true, skipped: true };

  try {
    // Gemini wackelt gern (503/429) – bis zu 3 Versuche mit Backoff, sonst
    // fehlt das Foto der Woche einfach (so geschehen in der Woche 20.07.).
    let res: Response | null = null;
    let lastErr = "";
    for (let attempt = 1; attempt <= 3; attempt++) {
      if (attempt > 1) await new Promise((r) => setTimeout(r, attempt * 5000));
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${dishNameGerman} (German canteen lunch dish), ${STYLE}` },
                ],
              },
            ],
          }),
        }
      ).catch(() => null);
      if (res?.ok) break;
      const status = res?.status ?? 0;
      lastErr = `Gemini HTTP ${status}`;
      // Nur bei transienten Fehlern erneut versuchen
      if (res && status !== 429 && status < 500) break;
    }
    if (!res || !res.ok) {
      const t = res ? await res.text().catch(() => "") : "";
      return { ok: false, error: `${lastErr}: ${t.slice(0, 200)}` };
    }
    const data = await res.json();
    const parts: Array<{ inlineData?: { mimeType?: string; data?: string } }> =
      data?.candidates?.[0]?.content?.parts ?? [];
    const img = parts.find((p) => p.inlineData?.data);
    if (!img?.inlineData?.data) {
      return { ok: false, error: "Gemini lieferte kein Bild" };
    }
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const raw = Buffer.from(img.inlineData.data, "base64");
    // Gemini liefert große (~2MB) PNGs – die kann der Next-Bildoptimierer auf dem
    // knappen Server-Speicher nicht verarbeiten (HTTP 500). Daher zu kompaktem
    // JPEG recodieren (Dateiname bleibt .png, wie die übrigen Menü-Fotos).
    try {
      const sharp = (await import("sharp")).default;
      // libvips-Cache aus und nur 1 Thread: Der Prozess soll nach der
      // Generierung nicht mit Bildspeicher vollhängen (danach schlug
      // ImageResponse/satori für Poster & Story fehl – siehe self-restart.ts).
      sharp.cache(false);
      sharp.concurrency(1);
      const jpeg = await sharp(raw)
        .resize({ width: 1280, withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true, mozjpeg: true })
        .toBuffer();
      writeFileSync(file, jpeg);
    } catch {
      // Fallback: sharp nicht verfügbar -> Rohbild speichern (besser als nichts)
      writeFileSync(file, raw);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}
